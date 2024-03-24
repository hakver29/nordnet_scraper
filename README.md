# Nordnet Integration

This is an backend-integration towards Nordnet. It is dependent on the following environment variables are added to the `.env` file:

```
USER_LOGIN_URL=https://www.nordnet.no/api/2/authentication/basic/login
ANON_LOGIN_URL=http://www.nordnet.no/api/2/login
NEXT_TOKEN_URL=https://www.nordnet.se/next/2
ORIGIN_URL=https://www.nordnet.no
password=
username=
WEBSOCKET_URL=wss://www.nordnet.no/ws/2/public
OSE_STOCKS_URL=https://www.nordnet.no/api/2/instrument_search/query/stocklist
```

The backend can be started by running 
```
npm run start
```