let helmBinary = '/usr/local/bin/helm';

const util = require('util');
const exec = util.promisify(require('child_process').exec);
const express = require('express')
const app = express()
const port = 80
var ipn = require('paypal-ipn');

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 




async function handleDeployment(args)
{
    const { stdout, stderr } = await exec(`"${helmBinary}" install server-deployment ${args}`);
    console.log('stdout:', stdout);
    console.log('stderr:', stderr);
}


function parseValues(o)
{
    let returnString = ''
    Object.keys(o).forEach((key) =>{
        var val = o[key];
        returnString+= `--set ${key}=${val} `
    });

    return returnString;
}


testObject = {
    "key1": "value1",
    "key2": "value2"
}

console.log(parseValues(testObject))

//main();

app.get('/', (req, res) => res.send('Hello World!'))
app.post('/ipn', (req, res) => {
    ipn.verify(req.body, {'allow_sandbox': true}, (err, msg) => {
        if (err) {
            console.error(err);
          } else {
            // Do stuff with original params here
            console.log(msg)
            console.log(req.body)
            let ipnVars = req.body
            switch(ipnVars.txn_type)
            {
                case 'recurring_payment_suspended': //Recurring payment suspended 
                    //This transaction type is sent if PayPal tried to collect a recurring payment, but the related recurring payments profile has been suspended.
                    //Uh-oh, payment failed! Temp suspend.

                    //payer_email
                    //txn_id
                    break;
                case 'subscr_payment': //Subscription payment received
                    //payer_email
                    //auth_amount
                    //item_namex
                    //option_name1 option_selection1
                    //option_name2 option_selection2
                    //txn_id

                    //TODO: set helm char to also render crd to allow for `kubectl get subscriptions`
                    let args = '';
                    args+= '--namespace=' + stringSafe(ipnVars.payer_email)
                    args+= ' --set email=' + ipnVars.payer_email
                    args+= ' --set memoryBurst=' + dollarRAMMap[ipnVars.auth_amount]
                    args+= ' --set storage=' + dollarStorageMap[ipnVars.auth_amount]
                    args+= ` --set ${option_name1}=${option_selection1}`
                    args+= ` --set ${option_name2}=${option_selection2}`
                    args+= ` --name=${txn_id}`
                    //TODO Regexp verify args at the least users cant just go "I want version rm -rf / --no-preserve-root"

                    break;
                case 'subscr_cancel': //Subscription canceled
                    
                    //payer_email
                    //txn_id
                    break;

                case 'subscr_signup': //Subscription started

                    break;
            }

          }
          res.send(200)
    })
})

app.post('/subscription', (req, res) => {
    console.log(req.body)
    if(req.body.event_type == "BILLING.SUBSCRIPTION.ACTIVATED")
    {
        var setString = "";
        setString += "--set minecraft.version==" + 
    }

    res.send(200)
})
app.listen(port, () => console.log(`Example app listening on port ${port}!`))


function stringSafe(str)
{
    str = str.replace(/\W+(?!$)/g, '-').toLowerCase();
    str = str.replace(/\W$/, '').toLowerCase();
    return str;
}

const dollarRAMMap = 
{
    2: 1,
    5: 2,
    7: 3,
    10: 4,
    15: 6,
    20: 8,
    24: 10,
    34: 14,
    44: 18,
    59: 24
}

const dollarStorageMap = 
{
    2: 12,
    5: 24,
    7: 36,
    10: 48,
    15: 64,
    20: 96,
    24: 120,
    34: 168,
    44: 216,
    59: 288
}
