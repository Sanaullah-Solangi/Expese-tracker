import React from "react";
import { Wallet, Moon, LogOut } from "lucide-react";

export default function Header({ user, onLogout }) {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-icon">
          <Wallet size={21} />
        </span>
        <span>
          <strong>SpendWise</strong>
          <small>Personal expense tracker</small>
        </span>
      </div>
      <div className="header-actions">
        <button className="icon-btn" aria-label="Toggle theme">
          <Moon size={17} />
        </button>
        {user && (
          <>
            <div className="profile">
              <span className="avatar">{(user.displayName || "L")[0]}</span>
              <span className="profile-text">
                <b>{user.displayName || "User"}</b>
                <small>{user.email}</small>
              </span>
            </div>
            <button
              className="icon-btn"
              onClick={onLogout}
              aria-label="Sign out"
            >
              <LogOut size={17} />
            </button>
          </>
        )}
      </div>
    </header>
  );
}
