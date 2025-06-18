import style from './module/style.module.css'

const Footer = () => {
  return (

    <footer className={style.footerContainer}> {/* Add a class for the main footer container */}
      <div className={style.footerColumns}>
        <div className={style.footerAboutUs}>
          <h4>Company</h4>
          <ul>
            <li><a href="/about">About Us</a></li>
            <li><a href="/contact">Contact</a></li>
            {/* ... more links ... */}
          </ul>
        </div>
        <div className={style.footerLink}>
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/inventory/new">New Cars</a></li>
            <li><a href="/inventory/used">Used Cars</a></li>
            {/* ... more links ... */}
          </ul>
        </div>
        <div className={style.footerColumn}>
          <h4>Connect</h4>
          {/* Social media icons */}
          <p>Subscribe to our newsletter:</p>
          {/* Newsletter form */}
        </div>
      </div>
      <div className={style.footerCopyright}>
        <p>© {new Date().getFullYear()} Road King Motor. All Rights Reserved.</p>
      </div>
    </footer>
  )
}
 export default Footer;