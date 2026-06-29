import {
  Show,
  SignInButton,
  SignOutButton,
  SignUpButton,
  UserButton,
} from "@clerk/react";
import "./App.css";

function App() {
  return (
    <>
      <div>
        <h1>This is Frontend</h1>
        <header>
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button type="button">Sign in</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button type="button">Sign up</button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
            <SignOutButton>
              <button type="button">Sign out</button>
            </SignOutButton>
          </Show>
        </header>
      </div>
    </>
  );
}

export default App;
