import c from './style.module.css';

const PrivacyPolicyPage = () => {
  return (
    <div className={c.pdfWrapper}>
      <div className={c.pdfContainer}>
        <h1 className={c.pdfTitle}>PRIVACY POLICY</h1>
        <div>
          <div className={c.pdfGameName}>Hextraction</div>
          <div>
            <p className={c.pdfParagraph}>
              This Privacy Policy for <b>Hextraction</b> (developed and
              published by <b>solbound.dev</b>) explains how and why we collect,
              store, use, and protect your information when you use our game and
              related services.
            </p>

            <ul className={c.pdfList}>
              <li>
                Accessing or playing our game Hextraction on Android, iOS, or
                Web
              </li>
            </ul>

            <p className={c.pdfParagraph}>
              Reading this Privacy Policy will help you understand your privacy
              rights and options. If you disagree with our practices, please do
              not use our game. For any privacy-related questions, contact us at{' '}
              <a className={c.pdfLink} href='mailto:hextraction@solbound.dev'>
                {' '}
                hextraction@solbound.dev{' '}
              </a>
              .
            </p>

            <div className={c.pdfSectionTitle}>
              WHAT INFORMATION DO WE COLLECT?
            </div>
            <p className={c.pdfParagraph}>
              We collect the following information when you use our services:
            </p>
            <ul className={c.pdfList}>
              <li>Solana wallet address (required for login and gameplay)</li>
              <li>In-game statistics (planned for future updates)</li>
            </ul>
            <p className={c.pdfParagraph}>
              We do not collect sensitive personal information such as names,
              emails, or location data.
            </p>

            <div className={c.pdfSectionTitle}>
              HOW DO WE USE YOUR INFORMATION?
            </div>
            <p className={c.pdfParagraph}>
              We process your wallet address and any future gameplay data to:
            </p>
            <ul className={c.pdfList}>
              <li>
                Enable secure login and game functionality through the Solana
                blockchain
              </li>
              <li>Process transactions to and from player wallets</li>
              <li>Distribute in-game rewards or prizes (in future updates)</li>
            </ul>

            <div className={c.pdfSectionTitle}>
              WHAT IS OUR LEGAL BASIS UNDER GDPR?
            </div>
            <p className={c.pdfParagraph}>
              In compliance with the General Data Protection Regulation (GDPR),
              we process your information under the following legal bases:
            </p>
            <ul className={c.pdfList}>
              <li>
                <b>Performance of a contract:</b> Your wallet address is
                necessary to access and use our game’s core functionality and
                transactions.
              </li>
              <li>
                <b>Legitimate interests:</b> To maintain and improve our
                services, ensure transaction integrity, and prevent abuse or
                fraud.
              </li>
              <li>
                <b>Consent:</b> By connecting your wallet, you consent to our
                use of your wallet address for in-game and transaction purposes.
              </li>
            </ul>

            <div className={c.pdfSectionTitle}>
              HOW LONG DO WE KEEP YOUR INFORMATION?
            </div>
            <p className={c.pdfParagraph}>
              We store wallet addresses permanently, as they are part of
              immutable blockchain records and necessary for ongoing game
              functionality. If you stop using Hextraction, we will retain your
              associated data only as required for record-keeping and compliance
              purposes.
            </p>

            <div className={c.pdfSectionTitle}>
              DO WE SHARE YOUR INFORMATION?
            </div>
            <p className={c.pdfParagraph}>
              We do not share your information with any third parties. Your
              wallet data is used exclusively within Hextraction for gameplay
              and transactions.
            </p>

            <div className={c.pdfSectionTitle}>
              HOW DO WE KEEP YOUR INFORMATION SAFE?
            </div>
            <p className={c.pdfParagraph}>
              We apply technical and organizational security measures to protect
              your information. However, due to the nature of blockchain
              technology, no electronic transmission or storage system is 100%
              secure. You acknowledge that transactions on the Solana network
              are public and visible on the blockchain.
            </p>

            <div className={c.pdfSectionTitle}>YOUR GDPR RIGHTS</div>
            <p className={c.pdfParagraph}>
              As an EU/EEA resident, you have the right to:
            </p>
            <ul className={c.pdfList}>
              <li>Request access to your personal data</li>
              <li>Request correction or deletion of your data</li>
              <li>Withdraw consent at any time</li>
              <li>Complain to your local data protection authority</li>
            </ul>
            <p className={c.pdfParagraph}>
              To exercise any of these rights, contact us at
              <a className={c.pdfLink} href='mailto:hextraction@solbound.dev'>
                {' '}
                hextraction@solbound.dev
              </a>
              .
            </p>

            <div className={c.pdfSectionTitle}>CHILDREN’S PRIVACY</div>
            <p className={c.pdfParagraph}>
              Hextraction is not specifically directed toward children. The game
              may involve future transactions or payments; users should be of
              legal age to participate in such activities under their local law.
            </p>

            <div className={c.pdfSectionTitle}>INTERNATIONAL USERS</div>
            <p className={c.pdfParagraph}>
              Our servers and infrastructure may be located outside your
              country. By playing Hextraction, you consent to the transfer of
              your data as necessary for gameplay.
            </p>

            <div className={c.pdfSectionTitle}>CHANGES TO THIS POLICY</div>
            <p className={c.pdfParagraph}>
              We may update this Privacy Policy occasionally to reflect
              operational, legal, or regulatory changes. The latest version will
              always be available in-app or on our website.
            </p>

            <div className={c.pdfSectionTitle}>CONTACT US</div>
            <p className={c.pdfParagraph}>
              For questions, requests, or concerns about this policy, contact:
              <a className={c.pdfLink} href='mailto:hextraction@solbound.dev'>
                {' '}
                hextraction@solbound.dev
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
