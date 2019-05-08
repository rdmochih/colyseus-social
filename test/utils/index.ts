import request from "phin";
import User, { IUser } from "../../src/models/User";
import { facebookAuth } from "../../src";

const FB_TEST_APP_ID = '353169041992501';
const FB_TEST_APP_TOKEN = '353169041992501|8d17708d062493030db44dd687b73e97';

export async function login(user: IUser) {
    user.online = true;
    return await user.save();
}

export async function resetTestUsers() {
    return await User.deleteMany({});
}

let cachedAccessTokens: string[];
export async function getTestUsersAccessTokens() {
    if (!cachedAccessTokens) {
        const response: any = (await request({
            url: `https://graph.facebook.com/v3.3/${FB_TEST_APP_ID}/accounts/test-users?access_token=${FB_TEST_APP_TOKEN}`,
            parse: 'json'
        })).body;

        if (response.error) {
            throw new Error(response.error.message);
        }

        cachedAccessTokens = response.data.map(entry => entry.access_token);
    }

    return cachedAccessTokens;
}

let cachedTestUsers: IUser[];
export async function createFacebookTestUsers () {
    if (!cachedTestUsers) {
        const accessTokens = await getTestUsersAccessTokens();
        cachedTestUsers = await Promise.all(accessTokens.map((accessToken) => {
            return facebookAuth(accessToken);
        }));
    }

    return cachedTestUsers;
}
