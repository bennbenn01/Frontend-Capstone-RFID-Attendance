import api from '../../utils/axios'

export const manageUsersSearchResults = async({ queryKey }) => {
    const [_key, { query, fields, page }] = queryKey;
    const response = await api.post(import.meta.env.VITE_APP_SEARCH_QUERY, {
        query,
        fields,
        page,
        manage_users: true
    });
    return response.data;
}