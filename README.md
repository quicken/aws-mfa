# AWS MFA

![GitHub issues](https://img.shields.io/github/issues/quicken/aws-mfa)

This command-line tool automatically creates a temporary profile inside the credentials file that has been authenticated with MFA.

Several variations of this type of tool already exist in various programming languages with a mix of features.

I needed something that worked with node, was less opinionated and provided some flexibility missing in some of the alternatives.

Hope this tool makes your life easier in AWS Land.

Cheers

Marcel 😎👍

- #herdingbits
- Youtube: https://youtube.com/herdingbits
- Blog: https://www.herdingbits.com

## Prerequisites

Requires node version 16+

Ensure that you have already configured a valid AWS Credentials file.

### See the official AWS Documentation for defining the credentials file:

https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html

### See the official AWS Documentation for using MFA:

https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-role.html#cli-configure-role-mfa

## Installation

https://www.npmjs.com/package/@herdingbits/awsmfa

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

1. Run the tool to automatically create a "mfa" profile inside your credentials file using your MFA session.
2. Use the created "mfa" profile anywhere you can specify an AWS profile.

This is especially useful inside the ~/.aws/config file as a "source_profile" for assuming roles securely.

However, it is also a good fit for working securely with the AWS-CLI, Serverless Offline as well as the AWS SDKs.

For basic help run:

```bash
awsmfa --help
```

### Basic Interactive Usage

For a basic setup, add your serial number to the profile that is linked to your MFA device to your **~/.aws/credentials** file.

**~/.aws/credentials**

```ini
[default]
aws_access_key_id=MYACCESSKEY000000000
aws_secret_access_key=thisisthesecretaccesskey01234567890ABCDE
mfa_serial=arn:aws:iam::012345678901:mfa/myuser
```

Run the command and when prompted, enter the MFA token code shown on your device.

```bash
awsmfa
```

The tool will not display any messages if successful. You can now use the automatically generated or update "mfa" profile to make calls to the AWS APIs.
For example, using the AWS CLI:

```bash
aws s3 ls --profile mfa
```

### Advanced Usage

_WARNING: This advanced use case will overwrite your default profile credentials._

In this scenario, you configure a "login" profile with your AWS credentials, **awsmfa** will then update your "default" profile with the temporary credentials.

**~/.aws/credentials**

```ini
[login]
aws_access_key_id=MYACCESSKEY000000000
aws_secret_access_key=thisisthesecretaccesskey01234567890ABCDE
mfa_serial=arn:aws:iam::012345678901:mfa/myuser
```

Run the command and when prompted, enter the MFA token code shown on your device.

```bash
# WARNING: This advanced use case will overwrite your default profile credentials.
awsmfa -p login --mfa-profile default
```

You can now just run any AWS command and it will use the default profile which is set to use your MFA session.

For example, using the AWS CLI:

```bash
aws s3 ls
```

Alternatively, if you use profiles to "assume roles". Configure your "profiles" in the **~/.aws/config** file as follows for easy MFA usage.

**~/.aws/config**

```ini
[profile devops]
region = ap-southeast-2
role_arn = arn:aws:iam::012345678901:role/devops-crew
source_profile = mfa
```

You can now authenticate with "awsmfa" and seamlessly use your "devops" profile to assume roles.

### Non-Interactive

The tool can also be run non-interactive for further automation or scripting.

In this example we enter the MFA code programmatically, authenticate with the "foo" profile and write our MFA credentials to the profile "coolio"

```bash
awsmfa -t 012345 -p foo --mfa-profile coolio
```

## Command-line Arguments

| Argument               | Description                                                                                                                                                                                                |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| -d, --duration-seconds | The duration in seconds, that the credentials should remain valid. Valid ranges are between 900 seconds (15 minutes) to 129,600 seconds (36 hours), with 43,200 seconds (12 hours) as the default.         |
| -h, --help             | Show help.                                                                                                                                                                                                 |
| -p, --profile          | Use the specific profile from the credentials file for getting the session. Note: This works differently to the AWS CLI in that profiles defined in the ".aws/config" file are ignored.                    |
| -s, --serial-number    | The identification number of the MFA device that is associated with the IAM user requiring MFA. The serial number can also be set for the profile in the credentials file using the "mfa_serial" property. |
| -t, --tokenCode        | The value provided by the MFA device. If this argument is omitted the command will pause and prompt the user for the token code.                                                                           |
| --mfa-profile          | The profile that temporary credentials are written to. Defaults to "mfa".                                                                                                                                  |
| --version              | Display version information.                                                                                                                                                                               |

## Change Logs

https://github.com/quicken/aws-mfa/blob/master/CHANGELOG.md

Please report any errors or make feature requests on GitHub.

https://github.com/quicken/aws-mfa/issues
