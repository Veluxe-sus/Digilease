// Everything an owner does sits behind Cognito sign-in. Receivers never see this.
// The Authenticator itself is untouched, only restyled: its sign-in card sits on the
// same grid as the landing page, beside a sample pass. Once somebody is signed in,
// `.owner` exists and both the grid and the sample go away, because app pages are
// plain paper.
import { Authenticator } from "@aws-amplify/ui-react";
import { Outlet } from "react-router-dom";
import SiteNav from "./SiteNav.jsx";
import AuthAside from "./AuthAside.jsx";
import ShapeGrid from "./reactbits/ShapeGrid.jsx";

// Sits under the Authenticator's card. It cannot go inside it: the slot that renders
// inside the card is the one Amplify already uses for the forgot-password link.
function AuthFooter() {
  return (
    <p className="auth-foot">
      DIGIPIN by India Post. We only ever email you about your own links.
    </p>
  );
}

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

      <div className="auth-split">
        <AuthAside />

        <Authenticator
          loginMechanisms={["email"]}
          signUpAttributes={["email"]}
          components={{ Footer: AuthFooter }}
        >
          {({ signOut }) => (
            <div className="owner">
              <SiteNav signedIn onSignOut={signOut} fixed />
              <Outlet />
            </div>
          )}
        </Authenticator>
      </div>
    </div>
  );
}
