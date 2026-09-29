import { Alert, Button, Card, Form, Input, Layout, Space, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/AuthContext';
import LanguageSwitcher from '../layout/LanguageSwitcher';
import { validationStatus } from '../../utils/form';
import {
  createLoginFormSchema,
  loginDefaultValues,
  type LoginFormValues,
} from './loginForm';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

function LoginPage() {
  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const schema = useMemo(() => createLoginFormSchema(i18n.language), [i18n.language]);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: loginDefaultValues,
  });

  const onSubmit = async (values: LoginFormValues) => {
    setAuthError(null);
    try {
      const ok = await login(values.username, values.password);
      if (!ok) {
        setAuthError(t('login.invalidCredentials'));
      }
    } catch {
      setAuthError(t('errors.unexpected'));
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <Card style={{ width: 400, maxWidth: '100%' }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <img src="/logo.png" alt="SEP" style={{ height: 40, objectFit: 'contain' }} />
              <LanguageSwitcher />
            </div>
            <div>
              <Title level={3} style={{ marginBottom: 4 }}>
                {t('login.title')}
              </Title>
              <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                {t('login.subtitle')}
              </Paragraph>
            </div>
            {authError !== null && <Alert type="error" showIcon message={authError} />}
            <form onSubmit={handleSubmit(onSubmit)}>
              <Controller
                name="username"
                control={control}
                render={({ field }) => (
                  <Form.Item
                    label={t('login.username.label')}
                    htmlFor="login-username"
                    required
                    validateStatus={validationStatus(!!errors.username)}
                    help={errors.username?.message}
                  >
                    <Input
                      {...field}
                      id="login-username"
                      autoComplete="username"
                      placeholder={t('login.username.placeholder')}
                    />
                  </Form.Item>
                )}
              />
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Form.Item
                    label={t('login.password.label')}
                    htmlFor="login-password"
                    required
                    validateStatus={validationStatus(!!errors.password)}
                    help={errors.password?.message}
                  >
                    <Input.Password
                      {...field}
                      id="login-password"
                      autoComplete="current-password"
                      placeholder={t('login.password.placeholder')}
                    />
                  </Form.Item>
                )}
              />
              <Button type="primary" htmlType="submit" block loading={isSubmitting}>
                {t('login.submit')}
              </Button>
            </form>
          </Space>
        </Card>
      </Content>
    </Layout>
  );
}

export default LoginPage;
