/*!

=========================================================
* Black Dashboard React v1.1.0
=========================================================

* Product Page: https://www.creative-tim.com/product/black-dashboard-react
* Copyright 2020 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/black-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React from "react";
import CsvUpload from './CsvUpload/CsvUpload'
import ProfileCsvUpload from './ProfileCsvUpload/ProfileCsvUpload'
import IPDRCsvUpload from './IPDRCsvUpload/IPDRCsvUpload'

// reactstrap components
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Table,
  Row,
  Col
} from "reactstrap";

class Tables extends React.Component {
  render() {
    return (
      <>
        <div className="content">
          <Row>
            <Col md="12">
              <Card>
                <CardHeader>
                  <CardTitle tag="h4">Data Upload</CardTitle>
                </CardHeader>
                <CardBody>
                  <CsvUpload/>
                  <IPDRCsvUpload/>
                  <ProfileCsvUpload/>
                </CardBody>
              </Card>
            </Col>
        </Row>
        </div>
      </>
    );
  }
}

export default Tables;
