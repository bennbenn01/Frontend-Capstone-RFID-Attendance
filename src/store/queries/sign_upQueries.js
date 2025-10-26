import api from "../../utils/axios"

export const sign_upQueriesFormCheck = async({ queryKey }) => {
    const [_key, { fname, lname }] = queryKey;

    const response = await api.post(import.meta.env.VITE_APP_SIGN_UP_CHECK_FORM, {
        fname,
        lname
    });
    return response.data;
}
