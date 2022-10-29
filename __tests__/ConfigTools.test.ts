import { expect, test } from "@jest/globals";
import "dotenv/config";
import { ConfigTool, CommandConfiguration, CredentialsEntry } from "../src/ConfigTool";
import { ValidationException } from "../src/ValidationException";

test("validate durationSeconds", () => {
    const credentialsEntry = getCredentialsEntry();
    const config = getDefaultConfig();

    /* Below Bounds */
    try {
        config.durationSeconds = 899;
        ConfigTool.validate(config, credentialsEntry);

        throw new Error("no error thrown when durationSeconds is below bounds.");
    } catch (e) {
        expect(e instanceof ValidationException).toBe(true);
    }

    /* Above Bounds */
    try {
        config.durationSeconds = 129601;
        ConfigTool.validate(config, credentialsEntry);

        throw new Error("no error thrown when durationSeconds is above bounds.");
    } catch (e) {
        expect(e instanceof ValidationException).toBe(true);
    }

    /* On lower boundary */
    try {
        config.durationSeconds = 900;
        ConfigTool.validate(config, credentialsEntry);
    } catch (e) {
        expect(e instanceof ValidationException).toBe(true);
        throw new Error("error thrown on lower boundary.");
    }

    /* In range boundary */
    try {
        config.durationSeconds = 43200;
        ConfigTool.validate(config, credentialsEntry);
    } catch (e) {
        expect(e instanceof ValidationException).toBe(true);
        throw new Error("error thrown in range.");
    }

    /* On upper boundary */
    try {
        config.durationSeconds = 129600;
        ConfigTool.validate(config, credentialsEntry);
    } catch (e) {
        expect(e instanceof ValidationException).toBe(true);
        throw new Error("error thrown on upper boundary.");
    }
});

test("validate tokenCode", () => {
    const credentialsEntry = getCredentialsEntry();
    const config = getDefaultConfig();

    /* token to short */
    try {
        config.tokenCode = "01234";
        ConfigTool.validate(config, credentialsEntry);

        throw new Error("no error thrown when token is too short.");
    } catch (e) {
        expect(e instanceof ValidationException).toBe(true);
    }

    /* token too long */
    try {
        config.tokenCode = "0123456";
        ConfigTool.validate(config, credentialsEntry);

        throw new Error("no error thrown when token is too long");
    } catch (e) {
        expect(e instanceof ValidationException).toBe(true);
    }

    /* token undefined. */
    try {
        config.tokenCode = undefined;
        ConfigTool.validate(config, credentialsEntry);
        throw new Error("no error thrown when token is undefined.");
    } catch (e) {
        expect(e instanceof ValidationException).toBe(true);
    }

    /* valid token */
    try {
        config.tokenCode = "012345";
        ConfigTool.validate(config, credentialsEntry);
    } catch (e) {
        expect(e instanceof ValidationException).toBe(true);
        throw new Error("error thrown on valid token.");
    }
});

test("validate prevent overwriting profile", () => {
    const credentialsEntry = getCredentialsEntry();
    const config = getDefaultConfig();

    /* If profile and mfa profile are equal this could oeverwrite credentials.
	this should be prevented. */
    try {
        config.profile = "testing";
        config.mfaProfile = "testing";
        ConfigTool.validate(config, credentialsEntry);

        throw new Error("no error preventing profile and mfa profile from being equal.");
    } catch (e) {
        expect(e instanceof ValidationException).toBe(true);
    }
});

test("validate credentials not found", () => {
    const config = getDefaultConfig();

    try {
        ConfigTool.validate(config, undefined);

        throw new Error("no error when credentials are undefined.");
    } catch (e) {
        expect(e instanceof ValidationException).toBe(true);
    }
});

test("validate mfa_serial", () => {
    /* Missing mfa serial */
    try {
        const config = getDefaultConfig();
        config.serialNumber = undefined;
        const credentialsEntry = getCredentialsEntry();
        credentialsEntry.mfa_serial = undefined;
        ConfigTool.validate(config, credentialsEntry);

        throw new Error("no error when serial number is undefined in config and credentials.");
    } catch (e) {
        expect(e instanceof ValidationException).toBe(true);
    }

    /* Missing mfa serial in credentials*/
    try {
        const config = getDefaultConfig();
        config.serialNumber = "arn:aws:iam::012345678901:mfa/myuser";
        const credentialsEntry = getCredentialsEntry();
        credentialsEntry.mfa_serial = undefined;
        ConfigTool.validate(config, credentialsEntry);
    } catch (e) {
        expect(e instanceof ValidationException).toBe(true);
        throw new Error("invalid error when serial number is defined in config and not in credentials.");
    }

    /* Missing mfa serial in config*/
    try {
        const config = getDefaultConfig();
        config.serialNumber = undefined;
        const credentialsEntry = getCredentialsEntry();
        credentialsEntry.mfa_serial = "arn:aws:iam::012345678901:mfa/myuser";

        ConfigTool.validate(config, credentialsEntry);
    } catch (e) {
        expect(e instanceof ValidationException).toBe(true);
        throw new Error("invalid error when serial number is defined in credentials and not in config.");
    }
});

function getDefaultConfig(): CommandConfiguration {
    return {
        tokenCode: "012345",
        profile: "default",
        durationSeconds: 43200,
        serialNumber: "arn:aws:iam::012345678901:mfa/myuser",
        mfaProfile: "mfa"
    };
}

function getCredentialsEntry(): CredentialsEntry {
    return {
        aws_access_key_id: "MYACCESSKEY000000000",
        aws_secret_access_key: "thisisthesecretaccesskey01234567890ABCDE"
    };
}
