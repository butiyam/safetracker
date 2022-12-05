import Layout from "../components/Layout";
import PageNav from "../components/global/PageNav";
import Footer from "../components/global/Footer";
import { Text, Container, Link, Grid, Image, Card, Button } from "@nextui-org/react";

export default function Donate() {

    return(
        <Layout>
            <PageNav/>

            <Container css={{ mt: 100 }} gap={2} md>
                <Text size={40} css={{ mb: 5, fontWeight: 900 }}>
                    Support SafeTracker
                </Text>
                
                <Text>
                    Want to help make BscTracker better? Donating just 
                    even $1 helps a ton! Of course, if you have the 
                    experience, you can help in other ways like 
                    contributing to the repo on Github!
                </Text>
            </Container>

            <Container css={{ mt: 50, mb: 100 }} gap={2} md>
               
                
                <Text size={20} css={{ mb: 5, fontWeight: 900 }}>
                    Crypto (Bsc Tokens Only)
                </Text>
                <Text css={{ mb: 20 }}>
                0xbdf91D291182f3E6e34b3bE5149bB1C16A4D8321
                </Text>

                <Card css={{ maxWidth: 150 }} variant="">
                    <Image src="/img/qrcode.png" />
                </Card>
                
            </Container>

            <Footer/>
        </Layout>
    )
}