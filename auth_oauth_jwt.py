"""
This example is about how to use the service jwt oauth process to acquire user authorization.
"""

# Firstly, users need to access https://www.coze.cn/open/oauth/apps. For the coze.com environment,
# users need to access https://www.coze.com/open/oauth/apps to create an OAuth App of the type
# of Service application.
# The specific creation process can be referred to in the document:
# https://www.coze.cn/docs/developer_guides/oauth_jwt. For the coze.com environment, it can be
# accessed at https://www.coze.com/docs/developer_guides/oauth_jwt.
# After the creation is completed, the client ID, private key, and public key id, can be obtained.
# For the client secret and public key id, users need to keep it securely to avoid leakage.

import os
import json

from cozepy import COZE_CN_BASE_URL, Coze, JWTAuth, JWTOAuthApp

# Load configuration from JSON file
config_file_path = "JWTOauth/coze_oauth_config.json"
try:
    with open(config_file_path, "r") as config_file:
        config = json.load(config_file)
except FileNotFoundError:
    print(f"Configuration file {config_file_path} not found. Using environment variables.")
    config = {}

# The default access is api.coze.cn, but if you need to access api.coze.com,
# please use base_url to configure the api endpoint to access
coze_api_base = config.get("coze_api_base") or os.getenv("COZE_API_BASE") or COZE_CN_BASE_URL

# client ID
jwt_oauth_client_id = config.get("client_id")
# private key (read from config)
jwt_oauth_private_key = config.get("private_key", "")
# public key id (read from config)
jwt_oauth_public_key_id = config.get("public_key_id", "")


# The sdk offers the JWTOAuthApp class to establish an authorization for Service OAuth.
# Firstly, it is required to initialize the JWTOAuthApp.


jwt_oauth_app = JWTOAuthApp(
    client_id=jwt_oauth_client_id,
    private_key=jwt_oauth_private_key,
    public_key_id=jwt_oauth_public_key_id,
    base_url=coze_api_base,
)

# The jwt oauth type requires using private to be able to issue a jwt token, and through
# the jwt token, apply for an access_token from the coze service. The sdk encapsulates
# this procedure, and only needs to use get_access_token to obtain the access_token under
# the jwt oauth process.

# Generate the authorization token
# The default ttl is 900s, and developers can customize the expiration time, which can be
# set up to 24 hours at most.
oauth_token = jwt_oauth_app.get_access_token(ttl=3600)

# use the jwt oauth_app to init Coze client
coze = Coze(auth=JWTAuth(oauth_app=jwt_oauth_app), base_url=coze_api_base)

# The jwt oauth process does not support refreshing tokens. When the token expires,
# just directly call get_access_token to generate a new token.
print(coze.workspaces.list().items)