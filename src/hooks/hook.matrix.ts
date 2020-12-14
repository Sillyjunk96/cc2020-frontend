import { useEffect, useState, ChangeEvent, useMemo } from 'react';
import { Matrix, MatrixInput } from '../types/type.matrix';
import * as AWS from 'aws-sdk';
import { Consumer } from 'sqs-consumer';
import config from '../configs/config.aws.json';

export const useMatrixListener = () => {
  const [matrices, setMatrices] = useState<Matrix[]>([]);

  useEffect(() => {
    const sqs = new AWS.SQS({
      accessKeyId: process.env.access_key_id,
      secretAccessKey: process.env.secret_access_key,
      sessionToken: process.env.session_token,
      region: process.env.REGION,
    });

    const consumer = Consumer.create({
      queueUrl: process.env.SQS_URL,
      sqs: sqs,
      handleMessage: async (message) => {
        const msg = JSON.parse(JSON.parse(JSON.stringify(message)).Body);

        const messageInfo = JSON.parse(msg.Message);

        if (messageInfo.type === 'new matrix generated') {
          const newMatrices = [...matrices];

          const matrix = messageInfo.matirx;
          newMatrices.push({
            id: matrix.id,
            rows: matrix.rows,
            columns: matrix.columns,
          });
          setMatrices(newMatrices);
        }
      },
    });

    consumer.start();
  }, [config]);

  return matrices;
};

export const useMatrixInput = () => {
  const [input, setInput] = useState<MatrixInput>({
    rows: undefined,
    columns: undefined,
  });

  const onInput = (type: string) => (event: ChangeEvent<HTMLInputElement>) =>
    setInput({ ...input, [type]: event.target.value });

  const resetInput = () => {
    setInput({ rows: undefined, columns: undefined });
  };

  return { values: input, onInput, resetInput };
};

export const useMatrixGeneratorTrigger = () => {
  const sns = useMemo(() => {
    return new AWS.SNS({
      accessKeyId: config.AWS_ACCESS_KEY,
      secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
      sessionToken: config.AWS_SESSION_TOKEN,
      region: config.REGION,
    });
  }, [config]);

  const onSubmit = (input: MatrixInput) => () => {
    sns
      .publish({
        TopicArn: process.env.SNS_TOPIC_ARN,
        Message: `{"rows": ${input.rows}, "columns": ${input.columns}}`,
      })
      .promise();
  };

  return onSubmit;
};
