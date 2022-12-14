const {WebhookClient} = require('dialogflow-fulfillment');

const mongoose=require('mongoose');
const Demand=mongoose.model('demand');
const Coupon=mongoose.model('coupons')
module.exports = app => {
    app.post('/', async (req, res) => {
        const agent = new WebhookClient({ request: req, response: res });

        function snoopy(agent) {
            agent.add(`Welcome to my Snoopy fulfillment!`);
        }

        async function learn(agent) {
            
            Demand.findOne({'course': agent.parameters.course}, function(err, course) {
                if (course !== null ) {
                    course.counter++;
                    course.save();
                } else {
                    const demand = new Demand({course: agent.parameters.course});
                    demand.save();
                }
            });
            let responseText = `You want to learn about ${agent.parameters.course}. 
                    Here is a link to all of my courses: https://www.udemy.com/user/ndat-course`;
            
            let coupon = await Coupon.findOne({'course':agent.parameters.course});
            if(coupon !==null){
                responseText = `You want to learn about ${agent.parameters.course}. 
                    Here is a link to all of my courses:${coupon.link}`;
            }
            agent.add(responseText);
        }

        function fallback(agent) {
            agent.add(`I didn't understand`);
            agent.add(`I'm sorry, can you try again?`);
        }
        let intentMap = new Map();

        intentMap.set('snoopy', snoopy);
        intentMap.set('learn courses',learn);
        intentMap.set('Default Fallback Intent', fallback);
  
        agent.handleRequest(intentMap);
    });

}