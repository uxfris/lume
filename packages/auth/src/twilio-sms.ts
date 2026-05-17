import Twilio from "twilio"

export type TwilioConfig = {
  accountSid: string
  authToken: string
  fromNumber: string
}

export function createTwilioSmsSender(config: TwilioConfig) {
  const client = Twilio(config.accountSid, config.authToken)

  return async function sendSms(to: string, body: string) {
    await client.messages.create({
      from: config.fromNumber,
      to,
      body,
    })
  }
}
