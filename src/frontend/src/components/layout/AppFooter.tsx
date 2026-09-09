import { Divider, Layout } from 'antd';

const { Footer } = Layout;

function AppFooter() {
  return (
    <>
      <Footer style={{ textAlign: 'center' }}>By Amigoscode</Footer>
      <Divider>
        <a
          rel="noopener noreferrer"
          target="_blank"
          href="https://amigoscode.com/p/full-stack-spring-boot-react"
        >
          Click here to access Fullstack Spring Boot & React for professionals
        </a>
      </Divider>
    </>
  );
}

export default AppFooter;
