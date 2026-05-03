'use client';

import Button from '../Button';
import LinknetLink from '../Link';
import Icon from '../Icon';
import { useModalRegistry } from '../../hooks/useModalRegistry';
import ModalFormRegistrationEnterpriseProvider, {
  useModalFormRegistrationEnterprise,
} from '../modals/ModalFormRegistrationEnterprise';
import ModalFormRegistrationEnterpriseSMBProvider, {
  useModalFormRegistrationEnterpriseSMB,
} from '../modals/ModalFormRegistrationEnterpriseSMB';
import ModalFormRegistrationFiberProvider, {
  useModalFormRegistrationFiber,
} from '../modals/ModalFormRegistrationFiber';
import ModalFormRegistrationMediaProvider, {
  useModalFormRegistrationMedia,
} from '../modals/ModalFormRegistrationMedia';
import ModalFormInquiryFiberProvider, {
  useModalFormInquiryFiber,
} from '../modals/ModalFormInquiryFiber';
import ModalFormSubscribeInternetFiberProvider, {
  useModalFormSubscribeInternetFiber,
} from '../modals/ModalFormSubscribeInternetFiber';
import ModalFormPartnershipEnterpriseProvider, {
  useModalFormPartnershipEnterprise,
} from '../modals/ModalFormPartnershipEnterprise';
import ModalFormSuggestEnterpriseProvider, {
  useModalFormSuggestEnterprise,
} from '../modals/ModalFormSuggestEnterprise';
import ModalFormEventRegisterProvider, {
  useModalFormEventRegister,
} from '../modals/ModalFormEventRegister';

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

function normalizeActionId(value) {
  return typeof value === 'string' ? value.trim().toLowerCase().replace(/_/g, '-') : '';
}

/**
 * Runtime renderer for CMS CTA lists.
 *
 * CMS stores CTA intent through `link_type`:
 * - `url`: render a regular anchor/button link using `href` and `target`.
 * - `action-modal`: prevent navigation and dispatch to `actionModalMap`.
 *
 * The editor side lives in:
 * `frontend/src/app/(admin)/pages/components/PageBuilderV2/editors/CtaListModule.tsx`.
 */
function CTAListContent({
  ctaList = [],
  align = 'left',
  className = '',
  itemClassName = '',
  ctaClassName = '',
  useButton = false,
  stackOnMobile = false,
  defaultVariant = 'primary',
  defaultSize,
}) {
  const { openModal } = useModalRegistry();
  const { openModal: openEnterprise } = useModalFormRegistrationEnterprise();
  const { openModal: openEnterpriseSmb } = useModalFormRegistrationEnterpriseSMB();
  const { openModal: openFiber } = useModalFormRegistrationFiber();
  const { openModal: openMedia } = useModalFormRegistrationMedia();
  const { openModal: openInquiryFiber } = useModalFormInquiryFiber();
  const { openModal: openSubscribeFiber } = useModalFormSubscribeInternetFiber();
  const { openModal: openPartnershipEnterprise } = useModalFormPartnershipEnterprise();
  const { openModal: openSuggestEnterprise } = useModalFormSuggestEnterprise();
  const { openModal: openEventRegister } = useModalFormEventRegister();

  if (!ctaList || ctaList.length === 0) return null;

  const alignClassMap = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  const Component = useButton ? Button : LinknetLink;

  /**
   * Maps CMS `action_modal` IDs to real modal open handlers.
   *
   * To add a new action modal:
   * 1. Add its option in CtaListModule.tsx (`ACTION_MODAL_OPTIONS`).
   * 2. Import its provider/hook in this file.
   * 3. Add the hook result to this map.
   * 4. Add the provider to the wrapper in the default CTAList export.
   *
   * If an ID is not found here, we fall back to `useModalRegistry()` so older
   * query-param based modals such as `get-started` still work.
   */
  const actionModalMap = {
    'form-registration': openEnterprise,
    'form-registration-enterprise': openEnterprise,
    'form-registration-enterprise-smb': openEnterpriseSmb,
    'form-registration-fiber': openFiber,
    'form-registration-media': openMedia,
    'form-inquiry-fiber': openInquiryFiber,
    'form-subscribe-internet-fiber': openSubscribeFiber,
    'form-partnership-enterprise': openPartnershipEnterprise,
    'form-suggest-enterprise': openSuggestEnterprise,
    'form-event-register': openEventRegister,
  };

  const openActionModal = (modalId, cta) => {
    const normalizedModalId = normalizeActionId(modalId);
    const openMappedModal = actionModalMap[normalizedModalId];

    if (openMappedModal) {
      openMappedModal(cta.modalPayload || cta.modal_payload || {});
      return;
    }

    if (modalId) openModal(modalId);
  };

  const renderIcon = (icon) => {
    if (!icon) return undefined;
    if (typeof icon === 'string' && (icon.startsWith('/') || icon.startsWith('http'))) {
      return <img src={icon} alt="" className="h-[1em] w-[1em] object-contain" aria-hidden="true" />;
    }
    return <Icon name={icon} />;
  };

  return (
    <div
      className={cx(
        'lnSection__cta flex flex-wrap gap-4',
        stackOnMobile ? 'flex-col sm:flex-row items-center' : '',
        alignClassMap[align] || 'justify-start',
        className
      )}
    >
      {ctaList.map((cta, index) => {
        const linkType = cta.linkType || cta.link_type || (cta.action || cta.actionModal || cta.action_modal ? 'action-modal' : 'url');
        const label = cta.label ?? cta.text ?? cta.button_text ?? cta.cta_text ?? '';
        const href = cta.href || cta.url || cta.action || '#';
        const modalId = cta.actionModal || cta.action_modal || cta.action || cta.modalId || cta.modal_id || href;

        return (
        <div key={index} className={itemClassName}>
          <Component
            variant={cta.variant || defaultVariant}
            size={cta.size || defaultSize}
            // URL mode navigates. Action modal mode stays on-page and opens a modal.
            href={linkType === 'action-modal' ? '#' : href}
            target={cta.target}
            rel={cta.target === '_blank' ? 'noopener noreferrer' : undefined}
            onClick={linkType === 'action-modal' ? (event) => {
              event.preventDefault();
              openActionModal(modalId, cta);
            } : cta.onClick}
            className={ctaClassName}
            iconLeft={renderIcon(cta.iconLeft || cta.icon_left)}
            iconRight={renderIcon(cta.iconRight || cta.icon_right || cta.icon)}
          >
            {label}
          </Component>
        </div>
        );
      })}
    </div>
  );
}

/**
 * CTAList owns the modal providers needed by action-modal CTAs.
 *
 * This keeps components such as AboutWithUSP simple: they only pass `ctaList`;
 * CTAList handles whether the item navigates or opens one of the registered
 * modal forms.
 */
export default function CTAList(props) {
  return (
    <ModalFormRegistrationEnterpriseProvider>
      <ModalFormRegistrationEnterpriseSMBProvider>
        <ModalFormRegistrationFiberProvider>
          <ModalFormRegistrationMediaProvider>
            <ModalFormInquiryFiberProvider>
              <ModalFormSubscribeInternetFiberProvider>
                <ModalFormPartnershipEnterpriseProvider>
                  <ModalFormSuggestEnterpriseProvider>
                    <ModalFormEventRegisterProvider>
                      <CTAListContent {...props} />
                    </ModalFormEventRegisterProvider>
                  </ModalFormSuggestEnterpriseProvider>
                </ModalFormPartnershipEnterpriseProvider>
              </ModalFormSubscribeInternetFiberProvider>
            </ModalFormInquiryFiberProvider>
          </ModalFormRegistrationMediaProvider>
        </ModalFormRegistrationFiberProvider>
      </ModalFormRegistrationEnterpriseSMBProvider>
    </ModalFormRegistrationEnterpriseProvider>
  );
}
