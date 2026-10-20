import './Privacy.css';

import { useNavigate } from 'react-router-dom';

import PrivacyHeader from './components/PrivacyHeader';
import PrivacyIntro from './components/PrivacyIntro';
import PrivacySection from './components/PrivacySection';
import PrivacyContact from './components/PrivacyContact';

function Privacy({ onBack }) {
  const navigate = useNavigate();

  return (
    <main className="privacy_page">
      <PrivacyHeader onBack={onBack || (() => navigate(-1))} />

      <div className="privacy_container">
        <PrivacyIntro />

        <PrivacySection title="1. Scope of This Privacy Policy">
          <p>
            This Privacy Policy explains how RMA (Raw Meat Application)
            collects, uses, stores, shares, and protects information when people
            use our website, application, and related services.
          </p>

          <p>
            It applies to customers, shop owners, delivery partners, and people
            who contact RMA. Additional agreements may apply to particular
            roles, but they should be read consistently with this Privacy
            Policy.
          </p>
        </PrivacySection>

        <PrivacySection title="2. Information We Collect">
          <p>
            The information collected depends on how you use RMA and the
            features you choose to use. It may include:
          </p>

          <ul>
            <li>
              <strong>Identity and contact details:</strong> name, phone number,
              email address, and other details you provide.
            </li>
            <li>
              <strong>Account information:</strong> account identifiers,
              login-related information, preferences, and account status.
            </li>
            <li>
              <strong>Address and location information:</strong> saved
              addresses, delivery instructions, selected map locations, and
              device location when you choose to provide it through available
              features.
            </li>
            <li>
              <strong>Order information:</strong> selected products, quantities,
              prices, order status, delivery details, and order-related
              communications.
            </li>
            <li>
              <strong>Payment-related records:</strong> payment method details
              or payment confirmation information used in the relevant
              transaction flow, along with applicable fees, refunds, or
              transaction records.
            </li>
            <li>
              <strong>Shop information:</strong> shop name, address, contact
              details, products, prices, availability, and registration or
              verification information.
            </li>
            <li>
              <strong>Delivery partner information:</strong> contact,
              application, verification, vehicle, licence, bank, wallet,
              earnings, and delivery-related records where required for
              onboarding and service operations.
            </li>
            <li>
              <strong>Support and communication:</strong> messages, complaints,
              feedback, reports, and other information you submit to RMA.
            </li>
            <li>
              <strong>Technical information:</strong> information such as
              device, browser, diagnostic, and usage data where it is collected
              by the platform or its service providers.
            </li>
          </ul>

          <p>
            Please provide only information needed for the relevant service. Do
            not submit another person's sensitive information unless you are
            authorised to provide it.
          </p>
        </PrivacySection>

        <PrivacySection title="3. How We Use Your Information">
          <p>
            RMA may use information for purposes connected with operating and
            maintaining the platform, including:
          </p>

          <ul>
            <li>Creating, maintaining, and securing accounts.</li>
            <li>Helping customers discover shops and available products.</li>
            <li>Recording orders and communicating order updates.</li>
            <li>Sharing necessary order details with the selected shop.</li>
            <li>
              Coordinating delivery and sharing necessary details with the
              assigned delivery partner.
            </li>
            <li>
              Maintaining order, payment-confirmation, fee, earnings, and
              transaction records.
            </li>
            <li>Responding to support requests, complaints, and disputes.</li>
            <li>
              Verifying shop and delivery partner applications where applicable.
            </li>
            <li>
              Detecting suspected fraud, misuse, security incidents, and
              unauthorised activity.
            </li>
            <li>Maintaining, troubleshooting, and improving RMA services.</li>
            <li>
              Meeting applicable legal obligations and protecting legitimate
              rights.
            </li>
          </ul>

          <p>
            Where consent is required for a particular use, RMA will seek it as
            required by applicable law. Information will not be used for an
            unrelated purpose where doing so is not permitted.
          </p>
        </PrivacySection>

        <PrivacySection title="4. Location and Delivery Addresses">
          <p>
            RMA uses delivery addresses and selected map locations to help shops
            and delivery partners fulfil orders. Location information may also
            help identify nearby shops or estimate delivery distances where
            those features are available.
          </p>

          <p>
            You may be able to enter an address manually, choose a location on a
            map, or use a device-location feature. Device-location access
            depends on the permissions and settings available on your device and
            browser.
          </p>

          <p>
            Providing device location is optional where the service allows an
            alternative. However, an order cannot be delivered without
            sufficient destination information.
          </p>

          <p>
            Do not assume that RMA continuously tracks your device. Any location
            collection depends on the features you use and the permissions or
            information you provide.
          </p>
        </PrivacySection>

        <PrivacySection title="5. Orders, Payments, and Transaction Records">
          <p>
            When a customer places an order, RMA uses relevant order information
            to support order management and fulfilment. Necessary details may be
            shared with the selected shop and, where delivery is requested, the
            assigned delivery partner.
          </p>

          <p>
            Under the current direct-to-shop payment flow, customers pay the
            shop using the shop's displayed UPI details or QR code. The shop
            owner is responsible for verifying receipt through the relevant
            payment application or bank account.
          </p>

          <p>
            RMA may maintain order and payment-confirmation records needed to
            show order status, resolve disputes, and operate the platform. These
            records do not necessarily mean that RMA received or held the
            customer's product payment.
          </p>

          <p>
            Platform fees, delivery payments, refunds, or other payment
            arrangements may follow separate processes. Where a third-party
            payment provider is used for a particular transaction, its own
            privacy policy and terms may also apply to information it processes.
          </p>

          <p>
            Do not share UPI PINs, passwords, one-time passwords, or other
            payment authentication secrets with RMA support or other users.
          </p>
        </PrivacySection>

        <PrivacySection title="6. When We Share Information">
          <p>
            RMA may share information when reasonably necessary to provide the
            requested service, protect users, or meet applicable legal
            obligations. This may include sharing with:
          </p>

          <ul>
            <li>
              <strong>Selected shops:</strong> customer contact details, order
              items, quantities, and fulfilment instructions needed to prepare
              the order.
            </li>
            <li>
              <strong>Assigned delivery partners:</strong> the customer's name
              or contact details, delivery destination, order reference, and
              information needed to complete the delivery.
            </li>
            <li>
              <strong>Technology and hosting providers:</strong> information
              processed to operate the website, application, database,
              notifications, security, or customer support.
            </li>
            <li>
              <strong>Payment providers or financial institutions:</strong>
              relevant information when a payment or financial service is
              actually handled by such a provider.
            </li>
            <li>
              <strong>Authorities or legal advisers:</strong> information where
              disclosure is required by law or reasonably necessary to address
              legal claims, safety, or suspected wrongdoing.
            </li>
          </ul>

          <p>
            Information shared with a shop or delivery partner may be handled by
            that party under its own responsibilities and applicable
            obligations. RMA does not authorise access to customer information
            for unrelated purposes.
          </p>

          <p>
            RMA does not intend to sell personal information to third parties.
            We do not promise that information is never shared; some sharing is
            necessary to fulfil orders and operate the platform.
          </p>
        </PrivacySection>

        <PrivacySection title="7. Notifications and Communications">
          <p>
            RMA may send service-related communications about account activity,
            order updates, delivery status, security, and support requests using
            the contact methods or notification features available in the
            platform.
          </p>

          <p>
            If you enable browser or device notifications, the platform and its
            notification service provider may process technical information
            needed to deliver them. You can manage available notification
            permissions through your device or browser settings.
          </p>

          <p>
            Important service or security communications may still be necessary
            to operate your account or fulfil a request.
          </p>
        </PrivacySection>

        <PrivacySection title="8. Cookies, Storage, and Technical Data">
          <p>
            RMA and its service providers may use browser storage, cookies, or
            similar technologies where implemented to remember preferences,
            maintain relevant application state, support account sessions,
            improve reliability, or protect the platform.
          </p>

          <p>
            The exact information stored depends on the feature and technology
            being used. Clearing browser storage or changing browser settings
            may affect features such as saved preferences or sessions.
          </p>
        </PrivacySection>

        <PrivacySection title="9. Data Security">
          <p>
            RMA uses reasonable safeguards intended to protect information
            against unauthorised access, loss, misuse, alteration, or
            disclosure. Safeguards may include access restrictions,
            authentication, and technical or organisational measures appropriate
            to the service.
          </p>

          <p>
            No website, application, or method of electronic transmission can
            guarantee absolute security. Please protect your login credentials
            and notify RMA if you suspect unauthorised access to your account.
          </p>
        </PrivacySection>

        <PrivacySection title="10. Data Retention">
          <p>
            RMA may retain personal information for as long as reasonably
            necessary for the purpose for which it was collected, including
            providing services, maintaining order and financial records,
            resolving complaints, preventing misuse, and meeting applicable
            legal requirements.
          </p>

          <p>
            When information is no longer required, RMA will handle it in
            accordance with applicable law and its relevant retention and
            deletion practices. Some records may need to be retained for longer
            where legally required or needed to resolve a dispute.
          </p>
        </PrivacySection>

        <PrivacySection title="11. Your Privacy Choices and Requests">
          <p>
            Depending on the feature available, you may be able to update your
            account details, manage saved addresses, or change notification and
            location permissions through the application, device, or browser
            settings.
          </p>

          <p>
            You may contact RMA to ask about your personal information or
            request correction, access, deletion, or other action available
            under applicable law. RMA may need to verify your identity before
            responding.
          </p>

          <p>
            A request may be subject to legal requirements and the need to
            retain certain records for legitimate operational, security, or
            legal purposes. Contacting support does not automatically mean that
            every record can be immediately deleted.
          </p>
        </PrivacySection>

        <PrivacySection title="12. Children's Privacy">
          <p>
            RMA's services are intended for people who are legally able to use
            the relevant service and enter into applicable transactions. A
            person should not create an account or place an order if they are
            not legally permitted to do so.
          </p>

          <p>
            If you believe a child has provided personal information
            inappropriately, contact RMA so the concern can be reviewed. Any
            action will be taken in accordance with applicable law.
          </p>
        </PrivacySection>

        <PrivacySection title="13. Third-Party Services and Links">
          <p>
            RMA may rely on external services for functions such as hosting,
            maps, notifications, payment services, or other technical features.
            External services may process information under their own privacy
            notices and terms.
          </p>

          <p>
            RMA is not responsible for the privacy practices of an independent
            third-party website or service. Review its applicable policies
            before providing information directly to it.
          </p>
        </PrivacySection>

        <PrivacySection title="14. Shop Owners and Delivery Partners">
          <p>
            Shop owners and delivery partners may need to provide additional
            information for registration, account security, shop operations,
            delivery assignments, verification, earnings, or other role-specific
            services.
          </p>

          <p>
            Access to such information should be limited to what is needed for
            the relevant RMA function. Shop owners and delivery partners must
            handle customer information they receive through RMA only for
            authorised order fulfilment and related legitimate purposes, and
            must not misuse or disclose it without a lawful basis.
          </p>

          <p>
            Role-specific agreements may set out additional obligations for shop
            owners and delivery partners. Those agreements do not replace this
            Privacy Policy.
          </p>
        </PrivacySection>

        <PrivacySection title="15. Changes to This Privacy Policy">
          <p>
            RMA may update this Privacy Policy as its services, technology, or
            legal requirements change. The revised version will be published on
            the platform with an updated revision date.
          </p>

          <p>
            If a change requires notice or consent under applicable law, RMA
            will take the steps required by that law.
          </p>
        </PrivacySection>

        <PrivacySection title="16. Contact RMA About Privacy">
          <p>
            If you have a privacy question, believe your information has been
            misused, or want to make a privacy-related request, contact RMA
            through the support page linked below.
          </p>

          <p>
            Please do not include passwords, UPI PINs, one-time passwords, or
            unnecessary sensitive information in your support request.
          </p>
        </PrivacySection>

        <PrivacyContact onContact={() => navigate('/profile/help-support')} />
      </div>
    </main>
  );
}

export default Privacy;
