import json
import os

import requests
from app import db
from flask import Blueprint, redirect, request, url_for
from flask_login import login_required, login_user, logout_user
from models import User
from oauthlib.oauth2 import WebApplicationClient

GOOGLE_CLIENT_ID = os.environ["GOOGLE_OAUTH_CLIENT_ID"]
GOOGLE_CLIENT_SECRET = os.environ["GOOGLE_OAUTH_CLIENT_SECRET"]
GOOGLE_DISCOVERY_URL = "https://accounts.google.com/.well-known/openid-configuration"

# Configure redirect URL for Google OAuth
PRODUCTION_URL = "https://gosolo.nyc"
CALLBACK_PATH = "/auth/google/callback"

client = WebApplicationClient(GOOGLE_CLIENT_ID)
google_auth = Blueprint("google_auth", __name__)

@google_auth.route("/auth/google")
def login():
    google_provider_cfg = requests.get(GOOGLE_DISCOVERY_URL).json()
    authorization_endpoint = google_provider_cfg["authorization_endpoint"]
    callback_url = f"{PRODUCTION_URL}{CALLBACK_PATH}" if os.environ.get("NODE_ENV") == "production" else request.base_url.replace("http://", "https://") + "/callback"

    request_uri = client.prepare_request_uri(
        authorization_endpoint,
        redirect_uri=callback_url,
        scope=["openid", "email", "profile"],
    )
    return redirect(request_uri)

@google_auth.route("/auth/google/callback")
def callback():
    code = request.args.get("code")
    google_provider_cfg = requests.get(GOOGLE_DISCOVERY_URL).json()
    token_endpoint = google_provider_cfg["token_endpoint"]

    callback_url = f"{PRODUCTION_URL}{CALLBACK_PATH}" if os.environ.get("NODE_ENV") == "production" else request.base_url.replace("http://", "https://")

    token_url, headers, body = client.prepare_token_request(
        token_endpoint,
        authorization_response=request.url.replace("http://", "https://"),
        redirect_url=callback_url,
        code=code,
    )
    token_response = requests.post(
        token_url,
        headers=headers,
        data=body,
        auth=(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET),
    )

    client.parse_request_body_response(json.dumps(token_response.json()))
    userinfo_endpoint = google_provider_cfg["userinfo_endpoint"]
    uri, headers, body = client.add_token(userinfo_endpoint)
    userinfo_response = requests.get(uri, headers=headers, data=body)

    userinfo = userinfo_response.json()
    if userinfo.get("email_verified"):
        users_email = userinfo["email"]
        users_name = userinfo["given_name"]
    else:
        return "User email not available or not verified by Google.", 400

    # Check if user exists
    user = User.query.filter_by(email=users_email).first()
    if user:
        login_user(user)
        return redirect(url_for('routes.sends'))
    else:
        # If new user, redirect to register page with pre-filled data
        return redirect(f'/register?name={users_name}&email={users_email}')

@google_auth.route("/auth/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for('routes.index'))