import { NodeSDK } from '@opentelemetry/sdk-node';
import { LangfuseSpanProcessor } from '@langfuse/otel';

// Registers the exporter Langfuse's LangChain CallbackHandler relies on - without this,
// the handler creates spans but nothing ever ships them to Langfuse.
if (process.env.LANGFUSE_SECRET_KEY) {
  const sdk = new NodeSDK({
    spanProcessors: [new LangfuseSpanProcessor()]
  });
  sdk.start();
}
