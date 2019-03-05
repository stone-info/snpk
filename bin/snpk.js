#! /usr/bin/env node

const { shell } = require('execa');
const program   = require('commander');
const ora       = require('ora');
const colors    = require('colors/safe');

program
  .version('0.1.0')
  .option('-p, --port [port]', 'port')
  .option('-c, --command [command]', 'command')
  .on('option:port', function (proxy) {
  })
  .on('option:command', function (host) {
  })
  .parse(process.argv);

if (!process.argv.slice(3).length) {
  program.outputHelp(make_red);
  return;
}

function make_red (txt) {
  return colors.red(txt); //display the help text in red on the console
}

// let proxy = `--proxy "socks5://127.0.0.1:1086"`;

let port,
    command;
if (program.port) {
  port = program.port;
}
if (program.command) {
  command = program.command;
}

killPort(port, command).then(() => {
  // do nothing
}).catch((err) => {
  throw err;
});

async function killPort (port, command) {
  let stdout;
  try {
    let r  = await shell('lsof -i:' + port);
    stdout = r.stdout;
  } catch (err) {
    console.log(`\x1b[31m${'端口 ' + port + ' 上没有进程'}\x1b[0m`);
    process.exit(0);
  }

  let list = stdout.split(/\n/).slice(1).map(item => {
    let strings = item.split(/ +(\d+) +/, 2);
    return {
      COMMAND: strings[0],
      PID    : strings[1],
    };
  });

  console.log(JSON.stringify(list, null, 2));

  list = list.filter(item => item.COMMAND === command);

  for (let i = 0; i < list.length; ++i) {
    let item = list[i];
    await shell('kill -9 ' + item.PID);
    console.log(`\x1b[32m${`killed ${item.PID}[${item.COMMAND}]`}\x1b[0m`);
  }

}
