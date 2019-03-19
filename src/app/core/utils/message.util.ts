
export class MessageUtil {
  static getErrorMessage(res, defaultMsg: string = 'message.unknown_error') {
    if (!res) {
      return defaultMsg;
    }

    let msg = res.msg;

    if (!msg && res.error) {
      msg = res.error.msg;

      if (!msg && res.error.errors && res.error.errors.length > 0) {
        msg = res.error.errors.join('. ') + '.';
      }

      if (!msg) {
        msg = defaultMsg;
      }
    }

    return msg;
  }
}
