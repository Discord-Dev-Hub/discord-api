import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC = 'isPublic';

/** marks an endpoint as public, resulting in AuthGuard ignoring the authentication for it IF it doesn't carry any authentication */
export const PublicEndpoint = () => SetMetadata(IS_PUBLIC, true);
