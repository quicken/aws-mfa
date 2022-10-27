# AWS MFA

This tool automatically creates a temporary profile inside the credentials file that has been authenticated with MFA.

Several variations of this type of tool already exist in various programming languages with a mix of features.

I needed something that worked with node, was less opinionated and provided some flexibility missing in some of the alternatives.

## Prerequisites

Requires node version 16+

Ensure that you have already configured a valid AWS Credentials file.

### See the official AWS Documentation for defining the credentials file:

https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html

### See the official AWS Documentation for using MFA:

https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-role.html#cli-configure-role-mfa

## Installation

For npm users:

```
npm i -g @herdingbits/awsmfa
```

For yarn users:

```
yarn global add @herdingbits/awsmfa
```

If you would like to try without installing it first:

```
npx @herdingbits/awsmfa
```

## Usage

1. Run the tool to create a "mfa" profile with a running MFA AWS Session.
2. Use the created "mfa" profile with anywhere you can specify a "profile"

This is especially useful inside the ~/.aws/config file as a "source_profile" for assuming roles securely.

However, it is also a good fit for working securly with the AWS-CLI, Serverless Offline as well as the AWS SDKs.

For basic help run:

```
awsmfa --help
```

### Interactive

In the simplest usage:

```
awsmfa
```

When prompted, enter the MFA token code that is shown on the MFA device that is set for the profile (using the "mfa_serial" property).

The tool will then acquire a session token using the "default" profile and create or overwrite the "mfa" profile inside the credentials file.

### Arguments

#### -d, --duration-seconds

    The duration in seconds, that the credentials should remain valid. Valid ranges are between 900 seconds (15 minutes) to 129,600 seconds (36 hours), with 43,200 seconds (12 hours) as the default.

#### -p, --profile

    Use a specific profile from the credentials file. Note: This works differently to the AWS CLI in that profiles defined in the ~~.aws/config~~ file are ignored.

#### -s, --serial-number

    The identification number of the MFA device that is associated with the IAM user requiring MFA.

#### -t, --tokenCode

    The value provided by the MFA device. If this argument is omitted the command will pause and prompt the user for the token code.

#### --mfa-profile

    The profile that temporary credentials are written to. Defaults to "mfa".
