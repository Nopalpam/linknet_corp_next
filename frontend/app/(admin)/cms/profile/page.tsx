'use client';

import { useState } from 'react';
import { Container, Row, Col, Nav, Tab } from 'react-bootstrap';
import GeneralTab from '@/components/profile/GeneralTab';
import SecurityTab from '@/components/profile/SecurityTab';
import DangerZoneTab from '@/components/profile/DangerZoneTab';
import useProfile from '@/hooks/useProfile';
import './profile.scss';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('general');
  const { profile, isLoading, error, mutate } = useProfile();

  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <div className="alert alert-danger">
          Failed to load profile. Please try again later.
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row>
        <Col>
          <h1 className="mb-4">My Profile</h1>
        </Col>
      </Row>

      <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'general')}>
        <Row>
          <Col lg={3} className="mb-4">
            <Nav variant="pills" className="flex-column profile-nav">
              <Nav.Item>
                <Nav.Link eventKey="general">
                  <i className="bi bi-person me-2"></i>
                  General
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="security">
                  <i className="bi bi-shield-lock me-2"></i>
                  Security
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="danger">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Danger Zone
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>

          <Col lg={9}>
            <Tab.Content>
              <Tab.Pane eventKey="general">
                <GeneralTab profile={profile} mutate={mutate} />
              </Tab.Pane>

              <Tab.Pane eventKey="security">
                <SecurityTab profile={profile} />
              </Tab.Pane>

              <Tab.Pane eventKey="danger">
                <DangerZoneTab profile={profile} />
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
}
