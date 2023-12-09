import { TerminalEscapeCodes } from './colors';

const formatStatus = (status: number) => {
  let color: TerminalEscapeCodes;
  switch (true) {
    case status >= 500:
      color = TerminalEscapeCodes.BgRed;
      break;
    case status >= 400:
      color = TerminalEscapeCodes.BgYellow;
      break;
    case status >= 300:
      color = TerminalEscapeCodes.BgCyan;
      break;
    case status >= 200:
      color = TerminalEscapeCodes.BgGreen;
      break;
    default:
      color = TerminalEscapeCodes.BgBlack;
  }
  return `${color} ${status} ${TerminalEscapeCodes.Reset}`;
};

const formatMethod = (method: string) => {
  let color: TerminalEscapeCodes;
  let padding = '';
  switch (method) {
    case 'GET':
      color = TerminalEscapeCodes.BgBlueBright;
      padding = '      ';
      break;
    case 'POST':
      color = TerminalEscapeCodes.BgCyan;
      padding = '     ';
      break;
    case 'PUT':
      color = TerminalEscapeCodes.BgYellow;
      padding = '      ';
      break;
    case 'PATCH':
      color = TerminalEscapeCodes.BgMagenta;
      padding = '    ';
      break;
    case 'DELETE':
      color = TerminalEscapeCodes.BgRed;
      padding = '   ';
      break;
    default:
      color = TerminalEscapeCodes.BgBlack;
  }
  return `${color} ${method}${padding} =>${TerminalEscapeCodes.Reset}`;
};

export { formatMethod, formatStatus };
