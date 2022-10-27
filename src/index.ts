import fs from "fs";
import ini from "ini";
import os from "os";
import { Credentials } from "@aws-sdk/types";
import { STS, GetSessionTokenCommandInput, STSServiceException } from "@aws-sdk/client-sts";
import { ConfigTool, CredentialsEntry } from "./ConfigTool";
import { ValidationException } from "./ValidationException";

(async function () {
    try {
        const credentialsFile = os.homedir() + "/.aws/credentials";
        const store = ini.parse(fs.readFileSync(credentialsFile, "utf-8"));

        /* #####################################*/
        /* Get configuration from args and/or by prompting the user. */
        const config = await ConfigTool.readArgs();
        if (!config.tokenCode) {
            config.tokenCode = await ConfigTool.promptForToken(config.profile);
        }

        const credentialsEntry = store[config.profile] as CredentialsEntry;
        config.serialNumber = config.serialNumber ? config.serialNumber : credentialsEntry.mfa_serial;

        ConfigTool.validate(config, credentialsEntry);

        /* #####################################*/
        /* Fetch STS Token */
        const rootCredentials: Credentials = {
            accessKeyId: credentialsEntry.aws_access_key_id,
            secretAccessKey: credentialsEntry.aws_secret_access_key
        };

        const sts = new STS({
            credentials: rootCredentials
        });

        const getSessionTokenCommandInput: GetSessionTokenCommandInput = {
            SerialNumber: config.serialNumber,
            TokenCode: config.tokenCode + "",
            DurationSeconds: config.durationSeconds
        };

        const getSessionTokenCommandOutput = await sts.getSessionToken(getSessionTokenCommandInput);
        if (getSessionTokenCommandOutput.Credentials) {
            /* #####################################*/
            /* Write temporary credentials back to credentials file. */
            const mfaCredentials = getSessionTokenCommandOutput.Credentials;
            if (!store[config.mfaProfile]) {
                store[config.mfaProfile] = {};
            }
            store[config.mfaProfile].aws_access_key_id = mfaCredentials.AccessKeyId;
            store[config.mfaProfile].aws_secret_access_key = mfaCredentials.SecretAccessKey;
            store[config.mfaProfile].aws_session_token = mfaCredentials.SessionToken;
            fs.writeFileSync(credentialsFile, ini.stringify(store, {}));
        }
    } catch (e) {
        if (e instanceof STSServiceException) {
            console.log("\x1b[31m%s\x1b[0m", e.message);
        } else if (e instanceof ValidationException) {
            console.log("\x1b[31m%s\x1b[0m", e.message);
        } else {
            console.log(e);
        }

        process.exit(1);
    }
})();
