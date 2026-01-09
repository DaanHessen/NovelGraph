import { useState, useEffect } from 'react';

interface AuthorProfile {
    username: string;
    avatar: string | null;
    loading: boolean;
}

export function useAuthorProfile() {
    const [profile, setProfile] = useState<AuthorProfile>({
        username: '',
        avatar: null,
        loading: true
    });

    useEffect(() => {
        fetch('/api/settings/profile')
            .then(res => res.json())
            .then(data => {
                setProfile({
                    username: data.username || 'Author',
                    avatar: data.avatar || null,
                    loading: false
                });
            })
            .catch(err => {
                console.error('Failed to fetch profile', err);
                setProfile(prev => ({ ...prev, loading: false }));
            });
    }, []);

    return profile;
}
