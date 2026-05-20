import FormRegistrationSuccess from '@/components/main/FormRegistrationSuccess';
import { getPublicSettings } from '@/lib/cmsApi';
import { buildBasicMetadata } from '@/lib/seo';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const publicSettings = await getPublicSettings();

  return buildBasicMetadata({
    title: 'Form Submitted',
    description: 'Your Link Net enterprise form has been submitted.',
    locale,
    path: 'enterprise/form/success',
    noindex: true,
    publicSettings,
  });
}

export default function FormSuccessPage() {
  return <FormRegistrationSuccess />;
}
