import React from 'react';
import { Container, Row, Col, Image } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import './Home.css';
import dogWalkingIcon from './assets/images/dog-walking-icon.png';
import dogTrainingIcon from './assets/images/dog-training-icon.png';
import dogHeartIcon from './assets/images/heart-icon.png';
import dogHomeIcon from './assets/images/home-icon.png';
import petStoreIcon from './assets/images/pet-store-icon.png';
import suvIcon from './assets/images/suv-icon.png';
import dog1 from './assets/images/dog1.jpg'
import dog2 from './assets/images/dog2.jpg'
import dog3 from './assets/images/dog3.jpg'


function Home() {
  const location = useLocation();
  const message = location.state?.message;

  return (
    <>
      {/* Header Container */}
      <div className="header-container py-5 text-center">
        <div className="header-text">
          <h1 className="display-5 fw-bold title mb-4">WoofWalk</h1>
          <p className="mb-0 montserrat">Have You Walked Your Dog Today?</p>
        </div>
      </div>

      {/* Validation Message */}
      {message && (
        <Container>
          <div className="alert alert-warning text-center mt-3">
            {message}
          </div>
        </Container>
      )}

      {/* Services Section */}
      <Container className="px-4 pt-4" id="icon-grid">
        <h2 className="pb-2 border-bottom text-black">Services</h2>
        <Row className="row-cols-1 row-cols-sm-2 row-cols-md-3 g-4 pt-5">
          <Col className="d-flex align-items-start">
            <Image src={dogWalkingIcon} alt="Dog Walking" width={50} height={50} className="me-3" />
            <div>
              <h3 className="fw-bold fs-4">Dog Walking/Exercise</h3>
              <p className="text-black">Regular, Extended, and Individual Walks for your pup. We also offer playtime and visits to the dog park.</p>
            </div>
          </Col>
          <Col className="d-flex align-items-start">
            <Image src={dogHomeIcon} alt="Pet Sitting" width={50} height={50} className="me-3" />
            <div>
              <h3 className="fw-bold fs-4">Pet Sitting</h3>
              <p className="text-black">Short and Extended Visits to check on the pet, feed them, and give them some attention.</p>
            </div>
          </Col>
          <Col className="d-flex align-items-start">
            <Image src={suvIcon} alt="Pet Transportation" width={50} height={50} className="me-3" />
            <div>
              <h3 className="fw-bold fs-4">Pet Transportation</h3>
              <p className="text-black">Transportation for your pet to and from vet and grooming appointments, as well as daycare facilities.</p>
            </div>
          </Col>
          <Col className="d-flex align-items-start">
            <Image src={dogTrainingIcon} alt="Training Reinforcement" width={50} height={50} className="me-3" />
            <div>
              <h3 className="fw-bold fs-4">Training Reinforcement</h3>
              <p className="text-black">Reinforcement of basic commands, specific behaviors, and training you have already started.</p>
            </div>
          </Col>
          <Col className="d-flex align-items-start">
            <Image src={petStoreIcon} alt="Pet Supply Delivery" width={50} height={50} className="me-3" />
            <div>
              <h3 className="fw-bold fs-4">Pet Supply Delivery</h3>
              <p className="text-black">Delivery of pet food, toys, and other supplies to your home.</p>
            </div>
          </Col>
          <Col className="d-flex align-items-start">
            <Image src={dogHeartIcon} alt="Specialized Services" width={50} height={50} className="me-3" />
            <div>
              <h3 className="fw-bold fs-4">Specialized Services</h3>
              <p className="text-black">Specialized care for puppies and older dogs including socialization, basic training, gentler exercise and frequent bathroom breaks.</p>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Featured Section */}
      <Container className="px-4" id="featured-3">
        <Row className="g-5 py-5 row-cols-1 row-cols-lg-3">
          <Col className="feature col text-center">
            <div className="feature-icon d-inline-flex align-items-center justify-content-center bg-gradient fs-2 mb-3">
              <Image className="responsive-icon" src={dog1} alt="dog" fluid />
            </div>
            <h3 className="fs-2 text-body-emphasis mb-5">Happy and Healthy</h3>
            <p className="feature-text">Paragraph of text beneath the heading to explain the heading.</p>
            <Link to="/call-to-action" className="icon-link">
              Call to action
            </Link>
          </Col>
          <Col className="feature col text-center">
            <div className="feature-icon d-inline-flex align-items-center justify-content-center bg-gradient fs-2 mb-3">
              <Image className="responsive-icon" src={dog2} alt="dog" fluid />
            </div>
            <h3 className="fs-2 text-body-emphasis mb-5">One on One Attention</h3>
            <p className="feature-text">Paragraph of text beneath the heading to explain the heading.</p>
            <Link to="/call-to-action" className="icon-link">
              Call to action
            </Link>
          </Col>
          <Col className="feature col text-center">
            <div className="feature-icon d-inline-flex align-items-center justify-content-center bg-gradient fs-2 mb-3">
              <Image className="responsive-icon" src={dog3} alt="dog" fluid />
            </div>
            <h3 className="fs-2 text-body-emphasis mb-5">All Breeds Welcome</h3>
            <p className="feature-text">Paragraph of text beneath the heading to explain the heading.</p>
            <Link to="/call-to-action" className="icon-link">
              Call to action
            </Link>
          </Col>
        </Row>
      </Container>

      {/* Additional Section */}
      <div className="container-fluid" style={{ backgroundColor: '#add8e6' }}>
        {/* Content goes here */}
      </div>
    </>
  );
}

export default Home;
