import Layout from "../components/Layout";
import PageNav from "../components/global/PageNav";
import Footer from "../components/global/Footer";

import { Text, Container } from "@nextui-org/react";
import Link from "next/link";

export default function About() {

    const name    = <Link href="https://t.me/butiyam" target="_blank" rel="nofollow">Mahesh Butiya</Link>
    
    const email   = (
        <Link href="mailto:butiyam@gmail.com" target="_blank" rel="nofollow">
            butiyam@gmail.com
        </Link>);

    const telegram = (
        <Link href="https://t.me/butiyam" target="_blank" rel="nofollow">
            https://t.me/butiyam
        </Link>);

    return(
        <Layout>
            <PageNav/>

            <Container css={{ my: 100 }} gap={2} md>
                    <Text size={40} css={{ mb: 30, fontWeight: 900 }}>
                       About SafeTracker
                    </Text>
                    <Text css={{ mb: 20 }}>
                        Created by {name}, SafeTracker is an open-source website for tracking all of the 
                        popular cryptocurrencies on the Binance Smart Chain. We take requests
                        so if you want your token added, just give us a holler via&nbsp; 
                        Email or Telegram!
                    </Text>

                    <Text>Email: {email}</Text>
                    <Text>Telegram: {telegram}</Text>
            </Container>

            <Footer/>
        </Layout>
    )
}