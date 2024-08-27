import "../styling/Navbar.css";
import MyIcon from "../assets/MailchimpIcon.svg";

const NavBar = () => {
  return (
    <nav className="nav-bar">
      <div className="nav-container">
        <div className="nav-logo">Mailchimp</div>
        <div className="nav-icon">
          <img src={MyIcon} alt="Mailchimp Icon" className="icon-img" />
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
