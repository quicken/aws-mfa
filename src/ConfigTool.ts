import yargs from "yargs";
import prompt, { Schema } from "prompt";
import colors from "colors";
import { ValidationException } from "./ValidationException";

/**
 * Defines the configuration that is used when executing this command.
 */
export type CommandConfiguration = {
    tokenCode?: string;
    profile: string;
    durationSeconds: number;
    serialNumber?: string;
    mfaProfile: string;
};

/**
 * Defines values that are defined inside the profile section of the AWS credentials file.
 * NOTE: The typing currently only includes values needed by this tool and not the full set of
 * possible properties that could exist inside a AWS Credentials file.
 */
export type CredentialsEntry = {
    aws_access_key_id: string;
    aws_secret_access_key: string;
    mfa_serial?: string;
};

/**
 * Helper class for getting the commands configuration setting from arguments and/or from prompting the user.
 */
export class ConfigTool {
    /**
     * Read in command line arguments.
     * @returns Command Configuration
     */
    static readArgs = async (): Promise<CommandConfiguration> => {
        const options = await yargs
            .usage("Usage: -t <token-code>")
            .option("s", {
                alias: "serial-number",
                describe:
                    "The identification number of the MFA device that is associated with the IAM user requiring MFA.",
                type: "string",
                demandOption: false
            })
            .option("d", {
                alias: "duration-seconds",
                describe:
                    "The duration in seconds, that the credentials should remain valid. Valid ranges are between 900 seconds (15 minutes) to 129,600 seconds (36 hours), with 43,200 seconds (12 hours) as the default.",
                type: "number",
                demandOption: false
            })
            .option("p", {
                alias: "profile",
                describe:
                    "Use a specific profile from the credentials file. Note: This works differently to the AWS CLI in that profiles defined in the .aws/config file are ignored.",
                type: "string",
                demandOption: false
            })
            .option("t", {
                alias: "token-code",
                describe: "The value provided by the MFA device.",
                type: "string",
                demandOption: false
            })
            .option("mfa-profile", {
                describe: 'The profile that temporary credentials are written to. Defaults to "mfa".',
                type: "string",
                demandOption: false
            }).argv;

        const {
            t: tokenCode,
            p: profile = "default",
            d: durationSeconds = 43200,
            s: serialNumber,
            "mfa-profile": mfaProfile = "mfa"
        } = options;

        return {
            tokenCode: tokenCode,
            profile: profile,
            durationSeconds: durationSeconds,
            serialNumber: serialNumber,
            mfaProfile: mfaProfile
        };
    };

    /**
     * Prompt the user for the currently displayed MFA token.
     *
     * @param profile The profile for which the user is prompted.
     * @returns The token-code shown on the users device. (as entered by the user.)
     */
    static promptForToken = async (profile: string) => {
        const schema: Schema = {
            properties: {
                tokenCode: {
                    description: colors.green(`MFA code for "${profile}"`),
                    pattern: /^\d{6}$/,
                    type: "string",
                    message: colors.red("The token must be exactly 6 digits."),
                    required: true
                }
            }
        };
        prompt.start();
        const { tokenCode } = await prompt.get(schema);
        return parseInt(tokenCode as string, 10);
    };

    /**
     * Validates a command configuration. If validation fails a ValidationException error is thrown.
     *
     * @param config The command configuration that should be validated.
     * @param credential The credentials section that is being used as the source for RootCredentials.
     */
    static validate = (config: CommandConfiguration, credential: CredentialsEntry | undefined) => {
        if (config.durationSeconds < 900 || config.durationSeconds > 129600 || isNaN(config.durationSeconds)) {
            throw new ValidationException(
                "Invalid duration. Duration must be a value between 900 (15 minutes) and 129600 (36 hours)."
            );
        }

        if (!config.tokenCode || config.tokenCode.length != 6) {
            throw new ValidationException(
                "The token must be numeric and exactly 6 digits. Token is the token code that is displayed on your MFA device."
            );
        }

        if (config.profile === config.mfaProfile) {
            throw new ValidationException(
                "Profile and MFA Profile can not be the same value to prevent overwriting your credentials."
            );
        }

        if (!credential) {
            throw new ValidationException(`Unknown profile ${config.profile}. Does this profile exist?`);
        }

        if (!credential.mfa_serial && !config.serialNumber) {
            throw new ValidationException(
                'Unknown mfa serial number. Either define the parameter "mfa_serial" as a part of the profile within the credentials file or pass the mfa serial number with the -s argument.'
            );
        }
    };
}
