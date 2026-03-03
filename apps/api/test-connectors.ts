import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { ConnectorsService } from './src/connectors/connectors.service';
import { EncryptionService } from './src/common/encryption.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const connectorsService = app.get(ConnectorsService);
    const encryptionService = app.get(EncryptionService);

    const orgId = 'mock-org-id';
    console.log('🧪 Starting Connectors Verification...');

    try {
        // 1. Create a connector
        console.log('1. Creating SENDGRID connector...');
        const connector = await connectorsService.create(orgId, {
            type: 'SENDGRID',
            label: 'Main Email',
            config: { apiKey: 'SG.test-key-123' },
        });
        console.log(`✅ Connector created with ID: ${connector.id}`);

        // 2. Find all
        console.log('2. Finding all connectors for org...');
        const all = await connectorsService.findAll(orgId);
        console.log(`✅ Found ${all.length} connectors`);

        // 3. Find one and decrypt
        console.log('3. Finding one and verifying decryption...');
        const found = await connectorsService.findOne(connector.id, orgId);
        if (found.config.apiKey === 'SG.test-key-123') {
            console.log('✅ Decryption successful: API key matches');
        } else {
            throw new Error('❌ Decryption failed: API key mismatch');
        }

        // 4. Update
        console.log('4. Updating connector label...');
        await connectorsService.update(connector.id, orgId, { label: 'Updated Label' });
        const updated = await connectorsService.findOne(connector.id, orgId);
        if (updated.label === 'Updated Label') {
            console.log('✅ Update successful');
        } else {
            throw new Error('❌ Update failed');
        }

        // 5. Cleanup (optional)
        // console.log('5. Removing connector...');
        // await connectorsService.remove(connector.id, orgId);
        // console.log('✅ Removal successful');

        console.log('✨ All tests passed!');
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await app.close();
    }
}

bootstrap();
