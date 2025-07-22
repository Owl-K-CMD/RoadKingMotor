import style from './module/style.module.css';

const App = () => {
  return (
    <div className={style.container}>
  <h1>Privacy Policy</h1>
  <p><strong>Effective Date:</strong> July 10, 2025</p>

  <p>
    RoadKingMotor, we respects your privacy. This privacy policy explains how our app handles any personal information you may provide.
  </p>

  <h2>1. Information We Collect</h2>
  <p>
    This app does not collect personal data unless explicitly authorized by you (for example, through Facebook Login).
    If you grant permission, we may access your name, email, and manage your Facebook Page for the purpose of posting content you create.
  </p>

  <h2>2. How We Use Your Information</h2>
  <p>
    The data is used only to perform the tasks you requested (such as posting products to your Facebook Page).
    We do not sell, share, or use your data for any other purpose.
  </p>

  <h2>3. Data Security</h2>
  <p>
    We take appropriate security measures to protect your information and only store access tokens securely within your account.
  </p>

  <h2>4. Third-Party Services</h2>
  <p>
    This app integrates with Facebook's Graph API to allow posting. Facebook’s privacy policies apply when you use their services.
  </p>

  <h2>5. Contact Us</h2>
  <p>
    If you have questions about this policy, you can contact us at:  
    <a href="mailto:kumutimam@gmail.com">kumutimam@gmail.com</a>
  </p>

  <p>By using this app, you agree to this Privacy Policy.</p>
    </div>
  );
}

export default App;