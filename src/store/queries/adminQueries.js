import api from '../../utils/axios'

export const adminSearchResults = async({ queryKey }) => {
    const [_key, { query, fields, page }] = queryKey;
    const response = await api.post(import.meta.env.VITE_APP_SEARCH_QUERY, {
        query,
        fields,
        page,
        attendance: true
    });
    return response.data;
}