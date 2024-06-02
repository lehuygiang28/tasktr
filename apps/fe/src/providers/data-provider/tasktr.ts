'use client';

import dataProviderSimpleRest from '@refinedev/simple-rest';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export const tasktrDataProvider = dataProviderSimpleRest(API_URL);
