// Everything an owner does sits behind Cognito sign-in. Receivers never see this.
import { Authenticator } from "@aws-amplify/ui-react";
import { Link, NavLink, Outlet } from "react-router-dom";

export default function OwnerArea() {
  return (
    <Authenticator loginMechanisms={["email"]} signUpAttributes={["email"]}>
      {({ signOut, user }) => (
        <div className="owner">
          <header className="topbar">
            <Link to="/cards" className="wordmark">PataCard</Link>
            <nav className="topnav">
              <NavLink to="/cards" end>My cards</NavLink>
              <NavLink to="/new">New card</NavLink>
            </nav>
            <div className="account">
              <span className="muted account-email">{user?.signInDetails?.loginId}</span>
              <button type="button" className="btn-text" onClick={signOut}>Sign out</button>
            </div>
          </header>
          <Outlet />
        </div>
      )}
    </Authenticator>
  );
}
