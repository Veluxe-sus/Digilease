// Everything an owner does sits behind Cognito sign-in. Receivers never see this.
// The Authenticator itself is untouched, only restyled: its sign-in card sits on the
// same grid as the landing page. Once somebody is signed in, `.owner` exists and the
// grid behind it is switched off, because app pages are plain paper.
import { Authenticator } from "@aws-amplify/ui-react";
import { Outlet } from "react-router-dom";
import SiteNav from "./SiteNav.jsx";
import ShapeGrid from "./reactbits/ShapeGrid.jsx";

export default function OwnerArea() {
  return (
    <div className="auth-shell">
      <div className="auth-grid" aria-hidden="true">
        <ShapeGrid
          speed={0.35}
          squareSize={48}
          direction="diagonal"
          borderColor="rgba(217, 207, 168, 0.55)"
          hoverFillColor="#B05A28"
          hoverTrailAmount={5}
        />
      </div>

      <Authenticator loginMechanisms={["email"]} signUpAttributes={["email"]}>
        {({ signOut }) => (
          <div className="owner">
            <SiteNav signedIn onSignOut={signOut} fixed />
            <Outlet />
          </div>
        )}
      </Authenticator>
    </div>
  );
}
