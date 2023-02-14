import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import { SnsAction } from "aws-cdk-lib/aws-cloudwatch-actions";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Topic } from "aws-cdk-lib/aws-sns";
import { EmailSubscription } from "aws-cdk-lib/aws-sns-subscriptions";
import { Construct } from "constructs";

export class LambdaAlarm extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: {
      lambdaFunction: lambda.Function;
      emailRecipient: string;
    }
  ) {
    super(scope, id);

    const alarm = new cloudwatch.Alarm(this, "LambdaErrorAlarm", {
      alarmDescription: "Alarm for Lambda errors",
      metric: props.lambdaFunction.metricErrors(),
      threshold: 1,
      evaluationPeriods: 1,
      actionsEnabled: true,
    });

    const topic = new Topic(this, "EmailTopic");

    topic.addSubscription(new EmailSubscription(props.emailRecipient));

    alarm.addAlarmAction(new SnsAction(topic));
  }
}
