import React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { CSSProperties } from "react";

interface ResetPasswordEmailProps {
  resetLink?: string;
}

const baseUrl = process.env.BASE_URL || "http://localhost:3000";

export default function ResetPasswordEmail({ resetLink }: ResetPasswordEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>GabaG Indonesia Password Reset</Preview>
        <Container style={container}>
          <Section style={coverSection}>
            <Section style={imageSection}>
              <Img
                src={`${baseUrl}/images/white-logo.png`}
                width="300"
                height="100"
                alt="Gabag's Logo"
              />
            </Section>
            <Section style={upperSection}>
              <Heading style={h1}>Reset your password</Heading>
              <Text style={mainText}>
                We received a request to reset your password for your GabaG Indonesia account.
                Click the button below to create a new password. If you didn&apos;t request a
                password reset, you can safely ignore this email.
              </Text>
              <Section style={verificationSection}>
                <Text style={verifyText}>Reset Password</Text>
                <Button
                  style={buttonStyle}
                  href={resetLink}
                >
                  Reset Password
                </Button>
                <Text style={validityText}>(This link is valid for 1 hour)</Text>
              </Section>
            </Section>
            <Hr />
            <Section style={lowerSection}>
              <Text style={cautionText}>
                GabaG Indonesia will never email you and ask you to disclose or verify your
                password, credit card, or banking account number.
              </Text>
            </Section>
          </Section>
          <Text style={footerText}>
            This message was produced and distributed by GabaG Indonesia, © 2025, GabaG Indonesia,
            Inc.. All rights reserved. GabaG Indonesia is a registered trademark of{" "}
            <Link href="https://gabag-indonesia.com" target="_blank" style={link}>
              gabag-indonesia.com
            </Link>
            , Inc. View our{" "}
            <Link href="https://gabag-indonesia.com" target="_blank" style={link}>
              privacy policy
            </Link>
            .
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#fff",
  color: "#212121",
};

const container = {
  padding: "20px",
  margin: "0 auto",
  backgroundColor: "#eee",
};

const h1 = {
  color: "#333",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "20px",
  fontWeight: "bold",
  marginBottom: "15px",
};

const buttonStyle: CSSProperties = {
  boxSizing: "border-box",
  width: "100%",
  marginTop: "10px",
  marginBottom: "10px",
  borderRadius: "20px",
  backgroundColor: "black",
  padding: "12px",
  textAlign: "center",
  fontWeight: 600,
  color: "#FFFFFF",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
};

const link = {
  color: "#2754C5",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "14px",
  textDecoration: "underline",
};

const text = {
  color: "#333",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "14px",
  margin: "24px 0",
};

const imageSection = {
  backgroundColor: "black",
  display: "flex",
  padding: "20px 0",
  alignItems: "center",
  justifyContent: "center",
};

const coverSection = { backgroundColor: "#fff" };

const upperSection = { padding: "25px 35px" };

const lowerSection = { padding: "25px 35px" };

const footerText = {
  ...text,
  fontSize: "12px",
  padding: "0 20px",
};

const verifyText = {
  ...text,
  margin: 0,
  fontWeight: "bold",
  textAlign: "center" as const,
};

const validityText = {
  ...text,
  margin: "0px",
  textAlign: "center" as const,
};

const verificationSection = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const mainText = { ...text, marginBottom: "14px" };

const cautionText = { ...text, margin: "0px" };
