global.warnCheck = "";
const mockConsole = global.console;
global.console = {
    error: (val) => {
        global.warnCheck = val;
    },
    log: mockConsole.log,
    warn: (val) => {
        global.warnCheck = val;
    },
};