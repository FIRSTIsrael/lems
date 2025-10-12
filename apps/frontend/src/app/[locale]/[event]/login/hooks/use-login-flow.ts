import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DOMPurify from 'dompurify';
import { FormikHelpers } from 'formik';
import {
  useRecaptcha,
  createRecaptchaToken,
  removeRecaptchaBadge,
  apiFetch
} from '@lems/shared';
import { LoginFormValues, LoginStep } from '../types';
import { buildLoginRequestBody, buildRedirectUrl, parseApiError } from '../utils';

export function useLoginFlow(eventSlug: string, recaptchaRequired: boolean) {
  const router = useRouter();
  useRecaptcha(recaptchaRequired);

  const [currentStep, setCurrentStep] = useState<LoginStep>({ step: 'initial' });
  const [isLoading, setIsLoading] = useState(false);

  // Initialize the form by fetching roles
  useEffect(() => {
    const initializeForm = async () => {
      setIsLoading(true);
      try {
        const result = await apiFetch('/lems/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventSlug })
        });

        if (result.ok) {
          const responseData = result.data as LoginStep;
          setCurrentStep(responseData);
        }
      } catch (error) {
        console.error('Failed to initialize login form:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentStep.step === 'initial') {
      initializeForm();
    }
  }, [eventSlug, currentStep.step]);

  const handleSubmit = async (
    values: LoginFormValues,
    { setSubmitting, setStatus }: FormikHelpers<LoginFormValues>
  ) => {
    setStatus(null);
    setSubmitting(true);
    setIsLoading(true);

    try {
      const captchaToken = recaptchaRequired ? await createRecaptchaToken() : undefined;
      const requestBody = buildLoginRequestBody(eventSlug, values, currentStep, captchaToken);

      const result = await apiFetch('/lems/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!result.ok) {
        throw new Error(parseApiError(result));
      }

      const responseData = result.data as LoginStep;

      if (responseData.step === 'complete') {
        removeRecaptchaBadge();
        const redirectUrl = buildRedirectUrl(eventSlug, DOMPurify.sanitize);
        router.push(redirectUrl);
      } else {
        // Update to next step
        setCurrentStep(responseData);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'server-error';
      setStatus(message);
    } finally {
      setSubmitting(false);
      setIsLoading(false);
    }
  };

  return {
    currentStep,
    isLoading,
    handleSubmit
  };
}
