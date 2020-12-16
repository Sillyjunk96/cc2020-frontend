import { useState, useEffect, useMemo } from 'react';
import * as AWS from 'aws-sdk';
import { Consumer } from 'sqs-consumer';

export const useErrorListener = () => {
  const [errors, setErrors] = useState<string[]>();

  const sqs = useMemo(
    () =>
      new AWS.SQS({
        accessKeyId: process.env.REACT_APP_ACCESS_KEY_ID,
        secretAccessKey: process.env.REACT_APP_SECRET_ACCESS_KEY,
        sessionToken: process.env.REACT_APP_SESSION_TOKEN,
        region: process.env.REACT_APP_REGION,
      }),
    []
  );

  useEffect(() => {
    const errorCache: string[] = [];

    const consumer = Consumer.create({
      queueUrl: process.env.REACT_APP_ERROR_SQS_URL,
      sqs: sqs,
      pollingWaitTimeMs: 0,
      handleMessage: async (message) => {
        const msg = JSON.parse(`${message.Body}`).Message;
        const msgString = `${msg}`.replaceAll("'", '"');

        let messageInfo = JSON.parse(msgString);

        console.error(
          'error occured with error code: ',
          messageInfo.error.code
        );
        errorCache.push(messageInfo.error.message);
        setErrors([...errorCache]);
      },
    });

    consumer.start();
  }, []);

  return { errors };
};
