'use client'

import { Icon } from '@iconify/react'
import Link from 'next/link'

const policyLines = [
  'All crypto-related services, including USDT exchange, wallet transfers, and price discussions, are provided for informational and service purposes only.',
  'Cryptocurrency markets are highly volatile and involve significant risk. Prices may fluctuate rapidly, and users may experience partial or complete loss of funds.',
  'We do not provide financial, investment, or legal advice. Any transaction or decision made using our services is done solely at the user’s own discretion and risk.',
]

const keyTerms = [
  'All transfers are processed only after confirmation of funds',
  'Rates may change based on market conditions and liquidity',
  'Once a crypto transaction is completed, it is irreversible',
  'We are not responsible for losses due to incorrect wallet addresses, network delays, or third-party platform issues',
]

const compliance = [
  'Local laws and regulations',
  'KYC and AML requirements, if applicable',
]

const confirmations = [
  'You understand the risks involved in cryptocurrency transactions',
  'You are legally eligible to trade or exchange crypto',
  'You accept this policy and disclaimer in full',
]

export default function BusinessCooperationPage() {
  return (
    <main className="min-h-screen bg-[#00050f] flex justify-center text-white">
      <div className="w-full max-w-[420px] min-h-screen pb-24 bg-[#0b1220]">

        {/* Header */}
        <header className="flex items-center gap-3 px-5 pt-5">
          <Link
            href="/me/settings"
            className="rounded-full bg-white/5 p-2 text-white/70 hover:bg-white/10"
          >
            <Icon icon="solar:alt-arrow-left-bold" className="text-xl" />
          </Link>
          <h1 className="text-lg font-semibold">Business Cooperation</h1>
        </header>

        {/* Legal Notice */}
        <div className="mx-5 mt-5 rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-white/80">
          <div className="flex items-start gap-3">
            <Icon icon="solar:shield-warning-outline" className="text-xl text-blue-400 mt-0.5" />
            <div className="space-y-2">
              <p className="font-semibold text-white">
                Important Legal & Risk Disclosure
              </p>
              <p>
                This page contains legally relevant disclosures regarding cryptocurrency-related
                services, risks, and responsibilities. Please review carefully.
              </p>
            </div>
          </div>

          {/* Full disclosure content */}
          <div className="mt-4 space-y-3 text-xs text-white/70">
              <p>
                Cryptocurrency-related activities involve substantial risk, including but not
                limited to market volatility, liquidity shortages, smart contract vulnerabilities,
                network congestion, regulatory changes, and cyber attacks.
                These terms and conditions, relating to the provision of digital assets services of custody of digital assets on behalf of a clients, buying and selling digital assets for legal tender and exchange of digital assets against other digital assets via a Crypto-account opened with us via our mobile application (“Crypto T&Cs”), form the basis of the agreement between you and us. The provisions of these Crypto T&Cs will apply to you from the date on which you open your Crypto-account via the Application under the conditions detailed below, and from the date you accept these terms and conditions via the Application.
refers to the holder of the Crypto Account, and Shares Digital Assets, SDA refers to Shares Digital Assets, a simplified joint-stock company incorporated under the laws of France, registered as a digital asset service provider  with the French Financial Markets Authority under number E2023-071. References to these Crypto T&Cs include these Crypto T&Cs , as well as any other agreements or disclaimers that apply to your Crypto Account, each as amended or supplemented from time to time.

By accepting these Crypto T&Cs and opening and/or using your Crypto-account, you expressly accept the terms of these Crypto T&Cs, and any other agreement or document incorporated therein and/or to which they refer 

These Crypto T&Cs constitute a binding legal agreement and it is important that you read and understand the terms before you agree to them. Please note that the French version, available on this webpage, will prevail in case of discrepancy due to the translation. If you have any questions, you should contact our customer support using our contact form on our website or via our mobile application, or seek independent legal advice if necessary.

Important information – Preamble
Please read carefully
Things you need to know
The information provided by Shares Digital Assets tells you, in the context of this Agreement, about us, the legal terms and conditions applicable to the services we provide to you and the risks that apply to our digital assets services. You must read and accept them before you access our services. If you do not agree to these terms, you will not be able to access and use our digital asset services.

You should also carefully read the General Terms and Conditions of Use of the Shares Application, as well as any other contractual or information document, provided separately, to which you are asked to consent before using the features and services that we offer you.

You should also refer to our Risk Disclosure (in Appendix 1). Please read them carefully before you open your Crypto-account and using the Digital Assets Services. If you have any questions or doubts about the content of this important information and this Agreement, you should seek independent professional advice.

Lack of deposit insurance mechanism
Shares Digital Assets is not a member of the Deposit Guarantee Scheme and Resolution provided for in Articles L. 312-4 et seq. and L. 322-1 of the French Monetary and Financial Code. This securities guarantee scheme, the purpose of which is in particular to compensate the claim resulting from the unavailability of financial instruments held in a member institution, is not applicable to the custody of digital assets.

The Electronic Money Account is also not covered by this mechanism.

You can obtain more information on this subject by visiting: www.garantiedesdepots.fr

No advice
Shares Digital Assets offers a custodial service for digital assets, buying and selling digital assets in fiat currency and exchange of digital assets for other digital assets and allows you to open a crypto-account on the Application. In accordance with the regulations applicable to us, we will not assess the appropriateness of the investments we list in light of your experience and knowledge, and we are not obliged to warn you if any investment you are considering does not seem appropriate to us. We do not offer any advice and will not provide you with any personalised recommendations regarding the suitability or adequacy of any particular investment. Although we may from time to time provide you with factual information about investments, this information is not and should not be interpreted as advice. You are solely responsible for the decisions you make in relation to your orders. If you are uncertain as to whether an investment is appropriate for your individual circumstances or needs, you should seek independent professional advice.

Potential risks
The activity of buying and selling digital assets in a fiat currency and exchanging digital assets for other digital assets is risky. The value of your investments may fall or rise and you may get back less than your initial investment. In some cases, you may lose your entire initial investment. Past performance of an investment is not an indication of its future performance. Further details on the risk of investing in digital assets through your crypto-account are provided to you in our risk disclosure document in Appendix 1 to these Crypto T&Cs. Before using the Application to submit orders in relation to investment, you must determine whether you have understood the risks detailed in these Crypto T&Cs and Appendix 1.

Purchase and sale of digital assets in fiat currency
We provide for the purchase and sale of digital assets through our Application under the conditions set out in these Crypto T&Cs.

Exchange of digital assets for other digital assets

We provide for the exchange of digital assets for other digital assets via our Application under the conditions set out in these Crypto T&Cs.

Execution of your orders
We will not execute your orders ourselves, but use one or more digital asset market platforms with which we have agreements.

You can only cancel an order with our consent, and you cannot cancel an order once it has been executed. This means that it is important to ensure that you enter your order details correctly and that you are willing and able to enter into a binding commitment to buy, sell or exchange a digital asset when submitting your orders.

Maintaining digital assets

We will hold the investments in digital assets via our Application under the conditions set out in these Crypto T&Cs.

Electronic money account
Opening a Crypto-account with us involves opening an Electronic Money Account. This Electronic Money Account is provided by a third party electronic money institution, authorised to provide payment services, with whom you will have a direct contractual relationship. As such, Shares Digital Assets does not act as an agent for said electronic money institution.

You should note that your Electronic Money Account is not a bank account but an Electronic Money Account opened with a third party electronic money institution outside the Shares group of companies. The Electronic Money Account will be protected in accordance with the conditions of the electronic money institution concerned, and the regulations applicable to it.

Tax
Various tax regimes may apply to your trading in digital assets in fiat currency and exchanging digital assets for other digital assets, depending on your tax status and the tax regulations applicable to you. You are solely responsible for determining the tax impact of your activities through the Application and you should seek tax or legal advice if you have any questions or doubts in this regard. Shares Digital Assets, and any other company in its group, do not provide tax advice.

Your situation
You must comply with the legal and regulatory obligations applicable to you, in particular in terms of taxation, whether your residence or banking address is in France or abroad. You undertake to notify us, in the event of a change of contact details, address, bank address, tax situation, or any other fact, data, event, information, likely to affect the execution of this agreement, as well as to provide, as soon as possible, the corresponding supporting documents that we may be required to ask you in this regard.

Your finances
You should ensure that your personal finances are suitable for the purchase and sale of digital assets or the exchange of digital assets and that you have the ability to bear all losses that may arise from your investment activity via the Application. You should not rely on making a profit through the investments you have made to repay or forfeit any credit or financing you have contracted. You should not enter into a credit agreement in order to finance your activity of buying and selling digital assets or trading digital assets through the Application.

Article 1 - Definitions
Throughout these Crypto T&Cs, we use certain capitalised terms that have specific meanings as detailed below, these terms are, where applicable, used interchangeably in the singular or plural:

Digital Assets: means the digital assets available through the Application and for which you may submit Orders to us.

Application (or App): means the mobile application whose Features you use (as this term is defined below), under the conditions set out in the App Terms and Conditions of Use.

Customer: means the Users of the Application benefiting from the digital asset Services (as this term is defined below) offered by Shares Digital Assets, including you.

Electronic Money Account: means the electronic money account opened with the Electronic Money Institution (as this term is defined below), which you use to settle your Transactions (as this term is defined below), and to receive funds from the closing of your Positions (as this term is defined below).

Crypto-account: means the Digital Assets Account that you open with us via the Application.

User Account: has the meaning given to it in the General Terms and Conditions of Use:

General Terms and Conditions of Use (or “App T&Cs”): means the general terms and conditions of operation of the Application which are approved by the Customers, and which may be amended from time to time.

General Conditions of Services for Outsourced Payment (“Modulr T&Cs”): means the general conditions for the provision of our payment services that are separately provided to you by the Electronic Money Institution authorised to provide such services to you and with which we have entered into a partnership.

Base currency: means the euro (€) or currency of the country in which you reside.

Technical Failure: means one of the following cases: unavailability of access to the telephone network or the internet by us or by you, unavailability of our data hosted by third parties and for reasons attributable to these third parties, unavailability of access to your Crypto-account which is not our fault, technical problem inherent in the operation of a blockchain or a smart contract, unavailability of access or operation of the Electronic Money Account or failure of the Electronic Money Institution, unavailability of access to partner Digital Assets market platforms for the purchase or sale of Digital Assets by us on our own behalf, unavailability or loss by you of access to your User Account, resulting from the action of hackers, a logical attack or a computer virus or any other malice on your computer systems, those of the technical partners, or the marketplaces used by us for the Services making it impossible to carry out Transactions (as these terms are defined below), and any other Technical Failure listed by the General Terms and Conditions of Use.

AEoI: refers to the automatic exchange of information between France and its partners, subjecting financial institutions to the obligation to collect from their customers information relating to tax residence and, where the latter is not located in France, to the tax identification number of the holders of financial accounts, under the conditions set out in Article 1649 AC of the French General Tax Code.

European Economic Area (or EEA): means the European Economic Area, namely the Member States of the European Union as well as Iceland, Liechtenstein and Norway.

Electronic Money Institution: means the electronic money institution with which you open an Electronic Money Account, for the purpose of carrying out your payment transactions via the Application.

FATCA: means sections 1471 to 1474 of the U.S. Internal Revenue Code, as amended, any regulations or agreements arising therefrom, any official interpretation thereof, any law implementing an intergovernmental approach in this regard, in each case, as amended from time to time.

Features: means the various features offered by the Application, existing or future, as listed in the General Terms and Conditions of Use.

Transaction Fees (or Service Fees): means the fees charged by Shares Digital Assets to Customers in connection with the provision of the Services and detailed in the Fees Policy.

Force majeure: has the meaning given to it in the French Civil Code.

Price slippage: has the meaning given to it in Article 5.7 of these Crypto T&Cs.

Investments: means, at any time, all Digital Assets to which you have subscribed via the Application, and duly recorded in a Crypto-account.

Working Days: means Monday to Friday, with the exception of public holidays in the country of residence of the Customer. When it is not specified, the term “day” means a calendar day.

KYC: stands for “know your customer”, the procedure for identifying and verifying Customers, including you, and part of the anti-money laundering and anti-terrorist financing mechanism

Order: means any instruction from you via the Application to buy, sell or exchange  specific Digital Asset(s). Orders are executed on the partner Digital Asset Marketplace 

Recurring Buy Order: means any instruction from you via the Application to buy specific Digital Asset(s), on a regular basis, over a period of time defined by you.

Digital Asset Marketplace: means any digital asset marketplace on which  Digital Assets are acquired, sold or traded by Shares Digital Assets.

Fees Policy: means the Shares Digital Assets document describing all the Service Fees applicable to the Customer and communicated to the latter under the conditions of Article 7.

Positions: means the Investments position held as a result of the completion of the Transactions.

Digital Asset Services means the services provided by Shares Digital Assets under the conditions set out in Article 2 hereof.

Shares Digital Assets  means us, as a Digital Asset Service Provider, in connection with the provision of Digital Asset Services to you.

Applicable Regulations: means the legal and regulatory provisions of French law applicable to these Crypto T&Cs.

Transaction: means any Order to buy, sell or trade that has been executed and completed.

Users: means the Users of the Application benefiting from the Digital Assets Services offered by Shares Digital Assets, including you.

In these Crypto T&Cs:

any word or expression used that is defined by the Applicable Regulations will have the meaning given to it by said Applicable Regulations in these Crypto T&Cs, unless otherwise stated;
references to the legal provisions, regulations, codes, notices, guidelines, position-recommendations, instructions, and any other system under the Applicable Regulations, include the legal provisions, regulations, codes, notices, guidelines, positions-recommendations, instructions, and any other system under the Applicable Regulations, existing or future, applicable, as amended, extended, consolidated, replaced or updated over time;
references to laws or regulations are, for the avoidance of doubt, references to the laws or regulations applicable in France;
the headings of the articles are for information purposes only and do not affect the interpretation of these Crypto T&Cs.
The terms already defined within the framework of the General Terms and Conditions of Use of the Application have the same meaning within the framework hereof.

Article 2 - Our Services
2.1. List of the Services provided.
Pursuant to Article L.54-10-2 of the French Monetary and Financial Code, these Crypto T&Cs provides for the provision by Shares Digital Assets of the following Digital Asset Services:

The Digital Asset Custodial Service 
The buy and sell service of Digital Assets in fiat currency 
Exchange of Digital Assets for other Digital Assets
The Services offered by us relate to Digital Assets available on a partner Digital Assets Marketplace, and to any other Digital Assets we may offer in the future.
The Digital Asset Services are deemed to be provided at your initiative if you request them following any communication containing a promotion made by any means and which by its very nature is general and addressed to the public or a broader group or category of Customers. You acknowledge that Shares Digital Assets has not carried out, directly or indirectly, any act of banking and financial canvassing within the meaning of Article L. 341-1 of the French Monetary and Financial Code, with a view to seeking your agreement on these Crypto T&Cs, the Crypto Services we offer or the products we list.

Depending on your personal situation, only some of the Crypto Services may be available to you.

You consent to certain Crypto Services, or parts thereof, being outsourced and provided by third party companies to us, whether part of our group or external to our group; we remain responsible for the Services provided.

2.2. Scope of our Services
Your Transactions are carried out on your own initiative and under your full responsibility without any advice from us. We will execute your Orders on a partner Digital Asset Marketplace under the conditions set by the Applicable Regulations, and we will hold your Digital Assets in your Crypto-account.

As already described in the important information in the preamble above, Shares Digital Assets is not entitled to and is not obliged to provide you with investment advice relating to specific Digital Assets, on its own initiative or on your own solicitation and/or request, and will not carry out any verification as to the adequacy of the Digital Assets, with regard, in particular and without limitation, to your risk tolerance and your ability to bear losses.

We will not provide you with any investment, legal, tax or other advice. You shall furthermore not seek and/or solicit and/or require such advice from us, either from Shares Digital Assets, or from any other entity of the Shares group of companies to which we belong, or from any other Customer, and any decision to buy, trade or sell a Digital Asset that we list, is yours and we will not be responsible for your decisions. We do not provide any individual portfolio management services on Digital Assets.

2.3. Electronic communication
You confirm that we may communicate with you in paperless form, and that all the pre-contractual information and documentation provided to you will also be in electronic format. Where the Applicable Regulations require that documents to be provided on a durable medium, we will send you the documents in PDF form (Portable Document Format) files, which will be sent to your email and/or viewable via the Application. You will then be able to download them to your mobile device.

Article  Crypto-account opening on the application
3.1. General
Under the name Crypto-account, we open in our books a special and individual account, solely for the purpose of recording your Transactions made via the Application. This Crypto-account is necessarily linked to a User Account as such term is defined in the General Terms and Conditions of Use that you have accepted.

An Electronic Money Account attached to the Crypto-account will also be opened with a partner Electronic Money Institution under the conditions set out in Article 7, in order to debit or credit the cash consideration for the Transactions carried out in the Digital Assets booked on the Crypto-account. The Electronic Money Account operates in conjunction with the Crypto-account, the operating terms of which are set forth herein.

3.2. Opening your Crypto-account
3.2.1. Modalities
Before you can open a Crypto-account and carry out Transactions, you must first install the Application. The provision by SDA of the Crypto Services linked to the Crypto-account is thus only possible if you have installed the Application, your identity has been verified and you have provided all the supporting documents and documents requested in accordance with the App T&Cs and these Crypto T&Cs.

In any case, and in accordance with our internal commercial policy, we remain free to accept or refuse the opening of a Crypto-account without being required to justify our decision.

The Crypto-account is opened on your behalf and can only be an individual account. We do not open joint, undivided account or dismembered accounts. If, for any reason whatsoever, your individual account was likely to fall under the joint ownership or dismemberment regime, we kindly ask you to inform us immediately in order to make the necessary arrangements.

The Crypto-account cannot be opened in the name of a legal entity.

In the event that you are protected adult, all Digital Assets registered in the Crypto-account must be managed in accordance with the specific provisions relating to the protection regime to which you are subject, in accordance with the Applicable Regulations. When the capacity regime of the holder of the Crypto-account, recognised as applicable in France, is a regime of foreign law, it is expressly agreed that we must be provided beforehand with all the useful supporting documents likely to delimit and define the scope of the powers as well as the identity and the exact situation of the protected adult with regard to the applicable local regulations. We may not, under any circumstances, be held liable for transactions carried out by the protected person or his/her legal representative, in breach of the rules in particular of the French Civil Code, or any other applicable text, governing the operation of the Crypto-account and the accounts related thereto. We shall be held responsible for the consequences of a Transaction on the Crypto-account if we have not been informed of the setting up or modification of a protection measure.

The Crypto-account may not be used to hold Digital Assets on behalf of third parties and/or to carry out portfolio management on digital assets on behalf of third parties.

A Customer can only open a sole Crypto-account in out books, linked to his User Account.

3.2.2. Supporting documents
When you apply to open a Crypto-account, you must provide us with the following documents, as appropriate:

a valid and legible copy of a valid identity document; and
any other additional documents we deem necessary to comply with our legal and regulatory obligations.
Please note that depending on jurisdiction, in particular outside of France, other means of verifying your identity may be offered in the Application, and the list of accepted documents may be modified.

In accordance with these Crypto T&Cs, we will also verify your identity and if applicable, the origin of your funds, under the conditions set by the regulations relating to the fight against money laundering and the financing of terrorism.

3.3. Access to your Crypto-account
Your telephone number will be linked to your Crypto-account when it is open to ensure that the Crypto-account can only be accessible via your mobile phone, which serves as an authentication device. Only one mobile phone number can be linked to your Crypto-account.

We may also check the validity of the email address you have provided to us, which will allow us to contact you at any time by a mode of communication other than the Application interface.

You will have access to the User Account linked to your Crypto-account under the conditions set out in the App T&Cs.

3.4. Operation of the Crypto-account
3.4.1. General
The Crypto-account operates in accordance with the provisions of the Applicable Regulations. The Digital Assets registered in the Crypto-account may not be used by Shares Digital Assets for its own account or by any third party for their own account.

Under the terms of our custodial mission, we undertake to maintain the Digital Assets held in the account as a result of your Investments and to administer them.

We undertake to comply with the marketplace rules governing the circulation and security of Digital Assets, as defined by the Applicable Regulations.

3.4.2. Digital Assets offered on the Application
Only Digital Assets offered by us, available and accepted by us, may be held on your Crypto-account. We are under no obligation to accept the deposit of other Digital Assets into your Crypto-account.

At present, the Application Features do not allow the transfer of Digital Assets from an external crypto-account to the Crypto-account or from the Crypto-account to an external crypto account.

3.4.3. Restrictions of the Services
3.4.3.1. Minimum amount
We reserve the right to modify at any time, without notice, the minimum value in euros or quantity of Digital Assets related to the provision of a Service for a given Digital Asset (including the minimum purchase, sale or exchange amount). These amounts must necessarily include the Service Fees due to us for the performance of the Services that you have requested us to provide to you. These amounts are disclosed on the Application.

3.4.3.2. Maximum amount and limits
We provide the Crypto Services up to the maximum amount set on our Application as long as the Crypto-account does not present a security risk, you are able to justify the origin of the funds (in fiat currency or digital assets) during a purchase or sale, and only if we have given a favourable opinion to the performance of said Service, following, where applicable, the analysis of the documents and more generally the information you have transmitted to us.

Buying, selling or exchanging limits may be set over a period of three hundred sixty-five  rolling days, per day, over a given period or without a time limit and may apply to a given Digital Asset in the Crypto-account. The value of the limits corresponds to the cumulative amounts of all transactions carried out over the period. The purchase limits may be different depending on the means of payment.

You are informed of this on the Application.

3.4.4. Review and monitoring of your use of the Crypto Services
We may decide at any time to suspend a Service for a period not exceeding fourteen  Working Days from the request of the Service, without being liable for the consequences of such suspension. At the end of this period and without any time limit, we may decide to prohibit the performance of the Crypto Services that are the subject of these Crypto T&Cs, to prohibit or limit the use of certain means of payment, to block or suspend a User Account.

The questions we ask you allow us to know you, to better understand your motivations and to remove the doubt about the conditions under which you wish to benefit from a Service. We are required to ask you regulatory questions.

In the absence of a satisfactory response and cooperation from you:

In the case of a Crypto Service relating to a Transaction, we may cancel the Transaction in question and we will reimburse you by deducting Service Fees and any other losses incurred by us in connection with the completion of the said Transaction;
In the case of any other Crypto Service, we may decide to cancel the Service.
3.4.5. Suspension or blocking of a Crypto-account
A Crypto-account may be suspended or blocked by us at any time, including for reasons related to:

Compliance with the KYC procedure;
Compliance with regulatory requirements on the fight against money laundering and terrorist financing (AML/CFT);
At the specific request of the competent authorities;
Failure to comply with one of the provisions of these Crypto T&Cs and/or the App T&Cs;
The legitimate suspicion that you are a victim of fraud, theft, cyber-attack, extortion, manipulation, violence, blackmail or that you are unable to assess the risks associated with the Investments;
Bad behaviour (insults, threats, abusive requests, etc.).
A suspended or blocked Crypto-account prevents you from accessing the Crypto Services temporarily or permanently. We shall not be held liable under any circumstances for the consequences, of any nature whatsoever, related to the blocking or suspension of a Crypto-account, in particular the theft or loss in value of the Digital Assets held in a Crypto-account, or any other direct or indirect damage, occurring before or after the blocking or suspension due to an act of yours.

3.4.6. Deletion of a Crypto-account - at your initiative
You may request, at any time, the deletion of your Crypto-account by notifying the Customer Service by sending a message in the Application. We will comply with your request within a reasonable time.

To the extent that the Application does not currently allow for the transfer of the Digital Assets held in the Crypto-account to an external crypto-account, you will be required to sell the amount of Digital Assets held in the Crypto-account in order to transfer the corresponding funds to your Electronic Money Account. If the sale or exchange is not possible because the quantity of Digital Assets held is below the minimum threshold for sale or exchange of such Digital Asset as indicated on the Application or for any other reason not allowing such sale, you must wait for the Application to allow the transfer of the Digital Assets to another crypto-account, or contact the Customer Service to arrange such transfer, according to the terms and deadlines to be agreed with said Service.

3.4.7. Closure, suspension or blocking of the Crypto-account
We will also not be able to return to you, temporarily or permanently, Digital Assets held in your Crypto-account in the event of the occurrence of one or more of the following events:

Your User Account has been suspended, closed or blocked;
Our obligations related to the regulations on the prevention of money laundering and the financing of terrorism require us to take one of these precautionary measures;
A competent authority, such as a judicial, regulatory, supervisory, and/or administrative or tax authority, sends us a request to this effect;
We are subject to a cyber attack, a logical attack, a virus, generic or otherwise, a physical attack on our premises or an attack on the integrity of our employees in the performance of their duties;
The Application, and more generally our information systems, are undergoing maintenance;
If you have not logged into your Crypto-account for at least three (3) consecutive months, if you have not responded to a message from us within thirty (30) days of receiving it, or if you are deceased.
3.4.8. No withdrawal period
We wish to draw your attention to the fact that you do not have a right of withdrawal under these Crypto T&Cs.

3.5. Payment transactions on the Electronic Money Account linked to the Crypto-account
The Modulr T&Cs apply to the purposes of payment transactions related to Transactions.

Article 4 – Custodial service on digital assets
The holding of Digital Assets means the custody by us of the cryptographic keys of the Digital Assets that we hold on your behalf via the Application.

The provisions of the French Monetary and Financial Code, in particular with regard to the obligation to hold Digital Assets and the obligation to return them by us, are applicable to transactions recorded in the Crypto Account.

4.1. Availability of the Custodial Service
The Custodial Service is offered to Customers who have an operational Crypto-account and can access it through the Application.

The Custodial Service is available following a purchase of Digital Assets by a Customer.

We shall retain the cryptographic keys of the Digital Assets recorded in the account under the conditions set out herein. We shall keep all records and accounts necessary to enable us to distinguish at any time and without delay the Digital Assets you have deposited from those deposited by other Customers and from our own Digital Assets, segregated from our  Digital Assets.

The balance of a Customer Crypto-account is accessible at any time on the Application except in the event of Technical Failure, as such term is defined under the General Terms and Conditions of Use, or Force Majeure.

4.2. Operation of the Custodial Service
Shares Digital Assets offers its Customers the opportunity to safekeep the Digital Assets they bought in their Crypto-account.

Shares Digital Assets provides a Digital Asset Custodial Service using a technical solution from a third party service provider. Digital Assets are safekept using the technical processes developed by the specialised third-party service provider.

Customers do not hold the private key to the Crypto-account in which the Digital Assets held by Shares Digital Assets are deposited. Shares Digital Assets retains responsibility for the return of Digital Assets to the Customers.

A Customer Crypto-account is a position account that reflects the Customer balance per Digital Asset. Access to its Digital Assets is secured by Shares Digital Assets. The Customer expressly acknowledges that it does not have direct access to the Digital Assets, the custody being delegated to Shares Digital Assets.

Digital Assets are held by Shares Digital Assets in separate accounts depending on the nature of the Digital Assets. Customers Digital Assets are stored in accounts opened for this purpose and are not stored with the Digital Assets owned by Shares Digital Assets, being held in custody in segregated accounts.

Digital Assets held in your Crypto-account may become unavailable for purchase, sale or exchange due to the inability to place your Orders through our Digital Asset Marketplace partners. In this case, we will make a reasonable effort to inform you of the future unavailability of a specific Digital Asset. In this case, you will have until the date (included) that we have notified you to exchange or sell the Digital Assets concerned, failing which, you irrevocably authorise SDA to proceed with the sale of all such Digital Assets held in your Crypto-account. Any proceeds from the sale of such Digital Assets will be credited to your Electronic Money Account. In this context, and within the limits of the Applicable Regulations, you acknowledge that the sale of your Digital Assets under the conditions specified above may not in any way engage our liability.

4.3. Commitment and liability of Shares Digital Assets
Shares Digital Assets undertakes to implement the means at its disposal to ensure the security of the Digital Assets it safekeeps in its custody and the security and resilience of its computer systems. Shares Digital Assets has the human, material and technical resources to operate the Custodial Service.

Shares Digital Assets can only be held liable for breaches of its own computer systems under its control. It cannot therefore be held responsible for the consequences on the custody of Digital Assets of (i) a Technical Failure, including the technical partner(s) on which Shares Digital Assets relies to provide the Custodial Service, (ii) an event of Force Majeure, (iii) a breach of the Customer security of any nature whatsoever, a case of kidnapping or a ransom demand on the Customer or his relatives, a cryptolocking a computer attack or malicious intent on the part of hackers oa logical breach or a generic or non-generous virus affecting the  computer, e-mail system, telephone or computer resources, an error, negligence or malicious act attributable to the Customer, failure to comply with these conditions.

SDA shall indemnify Customers in the event that it is impossible to return the Digital Assets and/or the means of access to the Digital Assets as a result of an event directly attributable to SDA.

4.4. Fork and Airdrop Management
In the event of Fork  and/or Airdrop linked to Digital Assets held by Customers, Shares Digital Assets will carry out a case-by-case analysis of these situations in order to determine whether we wish to offer custody and/or trading of these new Digital Assets. In addition, the Digital Asset Marketplace and/or other third party service providers involved in the provision of Services to Customers may not allow us to effectively support Forks and Airdrops.

A fork can occur when a Blockchain splits into two different chains with different consensus rules compared to the original Blockchain. Shares Digital Assets will consider in each individual case, at its discretion, whether the Digital Assets allocated to a Customer of the Fork will continue to be supported.

An Airdrop consists of distributing a Digital Asset free of charge to a third party in a random manner depending on the performance of certain services by the beneficiary. There is therefore no financial compensation claimed in return for the services. In return, the beneficiary must respect certain commitments, which differ from one project to another. These can include joining a group on social networks, adding a Telegram channel, or sharing news.

4.5. Return of Safekept Crypto-assets
The Customer who has stored his Digital Assets with Shares Digital Assets is informed that, at the current stage of development of the Application, the Customer cannot request the withdrawal of Digital Assets stored in the Crypto-account to another crypto account outside the Application.

However, by proceeding with the purchase process, the Customer acknowledges and accepts that he/she will not be able to withdraw his/her Digital Assets from the Crypto-account unless the development of the Application Features allows it, where applicable.

Article 5 – Services for buying and selling digital assets in fiat currency
5.1. Your Orders
An Order (including a Recurring Buy Order) is an instruction from you to buy, sell or exchange (a) particular Digital Asset(s) which is made via the Application.

We currently provide Orders that are executed automatically, via API, on our partner Digital Asset Marketplace via our Application.

We will only transmit your Orders to our partner Digital Asset Market Marketplace for execution.

5.1.1. Your Recurring Buy Orders
You may choose to make the instruction of certain Orders automatic by submitting Recurring Buy Orders.

In addition to being subject to the same conditions applicable to so-called classic Orders, Recurring Buy Orders are subject to the following additional conditions:

You must define in the Application the period during which the Recurring Buy Order is placed and repeated (available periods are provided in the Application);
All Recurring Buy Orders will be created and transmitted to the Digital Asset Marketplace for execution between 10:15 AM and 10:45 AM CET. Orders are executed 7 days a week.
If your Electronic Money Account does not have a sufficient balance to pay for a given Recurring Buy Order (including any fees and/or charges applicable to that Order), that particular Recurring Buy Order will be ignored without affecting any future scheduled Recurring Buy Orders.
5.2. Execution of your Orders
If your Order is accepted by us and the Marketplace, it will be executed by the partner Digital Asset Marketplace. We are responsible for the execution of your Order submitted via the Application. We will only execute your Orders on the partner Digital Asset Marketplace with which we have entered into a partnership.

By opening a Crypto-account, you are deemed to consent to us executing your Orders on the partner Digital Asset Marketplace.

5.3. Submitting and cancelling Orders
Orders may only be submitted via the Application. Orders must relate exclusively to Digital Assets available via the Application, which we will make available to you at our sole discretion.

We will provide you with indicative prices of Digital Assets that you can buy, sell or exchange via the Application. We draw your attention to the fact that we do not set these prices and we have no control over them, as long as they are provided to us by the partner Digital Assets Marketplace. The execution prices of the Orders may differ from the prices displayed in the Application.

It is important to note that by submitting an Order to us, you enter into a binding commitment to buy, sell or trade a particular Digital Asset. You may no longer cancel or withdraw an Order when it is executed on the partner Digital Asset Marketplace, and cancellation may only take place, in any event, with our prior consent.

We will not be deemed to have received a request for cancellation or modification of the Order until we notify you of its receipt. Upon receipt of any request to cancel or amend an Order, we may, but will not be obliged to cancel or amend any Order after such Order has been transmitted to us. We will use all reasonable efforts to comply with your request for cancellation or amendment before the Order is executed by the partner Digital Asset Marketplace, but we will not be liable if such cancellation or amendment is not made. In the event that we cancel or amend, attempt to cancel or amend, any Order at your request, you will be required to pay any costs and expenses that we may incur. In other words, you will be bound by the execution by the partner Digital Asset Marketplace of any Order (whether in whole or in part) if and to the extent that such Order (or any part thereof) has not been cancelled or amended in accordance with your request.

For this reason, you must double-check that, before submitting an Order, you:

Have input the correct values;
Are able to pay for the Order;
Are certain that you wish to go ahead with that Order;
Understand how these Crypto T&Cs applies to that Order;
Are willing and able to bear the risk of any potential loss associated with that Investment, once such Investment has been made; and
Understand the risks associated with that investment.
It is therefore your sole responsibility to ensure that all Orders communicated are accurate, correct and clearly transmitted.

Notwithstanding the foregoing, all Orders transmitted to us shall be deemed irrevocable and we will be entitled to transmit such Orders to the partner Digital Asset Marketplace in accordance with the terms and conditions hereof.

5.4. Acceptance of Orders
We, and the partner Digital Asset Marketplace, have the final say on whether or not to accept an Order you have submitted. If we or the partner Digital Asset Marketplace reject an Order, we will not have to explain to you the reason for such rejection, but will notify you of the rejection of the Order.

The partner Digital Asset Marketplace also implements various procedures and limits in terms of risk and tolerance, which govern whether or not it will accept an Order, and we have no control over such trading procedures and restrictions.

Orders may also be rejected by us or the partner Digital Asset Marketplace for reasons relating to:

Trading restrictions imposed by the competent regulatory authorities on certain investments;
Trading restrictions imposed on us by the Partner Digital Asset Marketplace; or
You not having sufficient funds in your Electronic Money Account to pay for this Order; or
If accepting an Order would violate a limit we have placed on your Crypto-account or User Account.
5.5. Cancellation of Orders/Positions
There may be instances where we, or the partner Digital Asset Marketplace, are required, at the request of third parties and in particular the competent regulatory authorities, to cancel your Orders or Positions. In such circumstances, we will seek to notify you of such request. You then agree to use all reasonable efforts to cooperate with us and, to the extent necessary, the partner Digital Asset Marketplace to comply with any such request relating to the cancellation of your Orders, including with respect to taking any steps we may require you to take to respond to any request from a third party in connection with your Orders and/or Positions.

5.6. Prohibition of short selling
The Application cannot be used to short-sell a Digital Asset, i.e. sell a Digital Asset that you do not already own in anticipation of the price of that Digital Asset will fall, allowing the sale of a Digital Asset at a higher price and giving the opportunity to buy that Investment back in the market at a lower price at a later stage, the profit being the difference between the highest price and the lowest price. To sell a Digital Asset via the Application, you must have previously acquired that Digital Asset by submitting an order to buy that Digital Asset via the Application, which was subsequently executed.

5.7. Price slippage
Due to the inherent nature of a moving market, indicative prices can change, sometimes rapidly and significantly, and it may not be possible to execute your Order at the price shown on the Application before you place your Ordermeans that the price at which you submitted your Order may not be the price at which your Order is actually executed. In some circumstances, your Order may be executed at a price that will be better or worse for you than the price that was indicated to you via the Application when you placed your Order. We have no liability to you, and we are not under any circumstances obligated to provide you with the price difference or ensure the maintenance of the price indicated at the time of placing the Order if your Order is executed at a worse price than that indicated at the time you submitted the Order if this is due to exceptional circumstances at the Digital Asset Marketplace or in the case of the suspension or interruption of the services of the partner Marketplace.

5.8. Our reports, notices and other information
5.8.1. Consultation of your Crypto-account
You will be able to see in real time in the Application what Orders have been executed on your behalf by the partner Digital Asset Marketplace, and what you hold in your Crypto-account. Access to the Service of consulting your Crypto-account is a Feature governed by the App T&Cs.

5.8.2. Notices
We will send you a transaction confirmation notice for each Transaction carried out under the conditions set out herein. The transaction confirmation notice will be edited by us, and communicated via the Application for each Transaction, where it will be available for download. The transaction confirmation notice shall be made available as soon as possible and in any event not later than the first Working Day following the completion of the Transaction. You can ask us for an update on the status of your Order at any time, by contacting us via the Chat Feature of the Application. It will be your responsibility to notify us, via the Chat function of the Application, of the absence of receipt of a transaction confirmation notice at the end of the normal delivery times.

The notice may mention in particular:

The Digital Asset(s) concerned and their quantity;
The nature of the Order (buy, sell, exchange or other);
Date stamps (day, time) and execution price (unit and total);
The amount of the transaction with the fees, commissions, taxes and other taxes distinguished from the gross price;
The exchange rate obtained when the Order involves currency conversion;
The method of execution of the Order  own account or on a named third party platform
Details of payment by the Customer.
You will have a period of seven (7) Working Days, from the date of delivery of the notice, to make any comments or complaints. After this period, it will be deemed to have accepted the conditions of execution.

5.8.3. Periodic reports
We will send you or make available on a durable medium a report on your Digital Assets and assets, together with your Investments.

You will have a period of thirty (30) calendar days, from the date the report is sent or made available to submit any comments or complaints. After this period, you will be deemed to have approved it unless you can prove an error, omission or fraud from us.

5.8.4. Tax Information
In order to enable you to satisfy your tax obligations relating to the Digital Assets in the account, we will send you or make available on a durable medium, as soon as possible, before the deadline for submitting your annual tax return, a summary of transactions in Digital Assets, which may be in the form of a periodic report referred to in point 5.8.3.

In order to satisfy our own tax obligations, we may require you to provide us with details of your tax residence(s), to provide us, if necessary, with the necessary supporting documents, and to inform us immediately of your changes of residence.

5.9. Valuations
The indicative valuations of your Investments will be provided to you in Euros (€) or US Dollars ($) or any other fiat currency in force in your jurisdiction, applying the rates provided by the Electronic Money Institution and/or the partner Digital Asset Marketplace. Valuations will be updated on a near real-time basis. We cannot commit to the full accuracy of the information provided in this respect, a discrepancy may exist between the valuations indicated and the actual valuation of your Investments at the time you consult them, said valuations being provided to SDA Customers on the basis, in particular, of the information collected from the partner Digital Asset Marketplace, the accuracy and/or completeness of which we cannot guarantee. SDA shall not be liable to you for any direct or indirect damage and/or loss, if you decide to carry out Transactions, which would prove to be detrimental to you, by relying exclusively in your investment decision on the sole indication of these valuations.

5.10. Submissions of Orders in own name
You must act on your own behalf and for your own accounts in relation to all Orders submitted by you, meaning that you are the person that will buy, trade or sell Digital Asset(s). You cannot submit Orders on behalf of others. No power of attorney can be agreed on the Crypto-account opened with us.

Any Order that we receive through the use of the Application shall be deemed to be given in good faith to have been given by you, except in the event of your death or a revocation by you of any Order documented by the production of a document attesting to one of the aforementioned situations and which has been communicated to us and of which we have acknowledged receipt.

In accordance with the provisions of the App T&Cs and these Crypto T&Cs, we may suspend your ability to transmit Orders through the Application, including if we suspect or have reason to believe that the Orders issued using your Credentials, as this term is defined in the App T&Cs, have not been properly authorised by you. In this case, we will not be responsible for any loss resulting from said suspension.

We are not obliged to verify the identity of the person(s) transmitting the Orders at each Transaction, or the accuracy or truthfulness of these Orders and we shall not be liable for any loss (direct, indirect, special, consequential) that may result from unauthorised Orders.

All Orders shall be deemed to have been made  at the time of their receipt. You acknowledge and agree that when placing Orders for Digital Assets, there will be times when a quoted price will change prior to execution of the Order(s) due to market circumstances and that all Orders will be executed in the chronological order in which they are received, the Orders being thus placed.

To the extent permitted by Applicable Regulations, we will not be liable to you for any loss or damage (direct or indirect) resulting from the late receipt of any Order for any reason whatsoever, instruction or communication issued by you, or for any delay, omission, interruption in transmission or improper interception of any Order or instruction through any equipment or system. We will endeavour to resolve any issues or problems arising from the operation of the Application, in accordance with the General Terms and Conditions of Use and, where applicable, will take measures in accordance with market practice.

Article 6 –Exchange service of digital assets for other digital assets
To benefit from the Digital Asset Exchange Service, you must have an open and validated User Account and a Crypto-account in which Digital Assets are held. A suspended or blocked Crypto-account cannot be used to exchange Digital Assets for other Digital Assets.

When provided with an Exchange Service, you will enter the exact amount of Digital Assets to be exchanged and the type of Digital Assets you wish to receive as a result of the exchange. You may not exchange more Digital Assets than the balance of Digital Assets to be exchanged on your Crypto-account. You are the sole decision-maker of the exchange and you are free to cancel it before its validation.

The exchange parity between the two Digital Assets is displayed on the Application prior to the validation of the exchange operation. In the event of an Order relating to an exchange between Digital Assets, price slippage is governed by Article 5.7 hereof. You have a period indicated on the Application to validate and finalise the exchange. Once validated, the exchange transaction can no longer be cancelled. It may only be cancelled by us in the event of a Technical Failure or Force Majeure.

The amount of Digital Assets to be exchanged is subject to a minimum amount set by us at the time of the exchange transaction.

Once the exchange transaction has been approved, your Crypto-account is debited with the quantity of Digital Assets exchanged and credited with the quantity of Digital Assets received in exchange, taking into account the Transaction Fees associated with the exchange transaction. The amount of the new Digital Asset credited to your Crypto-account is available for another exchange immediately (except in the case of Technical Failure or Force Majeure).

A transaction notice detailing the transaction is available on the Application as of the Business Day following the transaction. This information is permanently displayed on the Application in the Transaction History.

If we have to cancel an exchange transaction for any reason attributable to you, after it has been approved by you, your Crypto-account will be credited back with the Digital Assets, less any losses incurred by us as a result of the price difference between the two Digital Assets at the time we made the exchange.

The provisions of this article, and all related provisions, will become applicable on the date of launch of the Exchange Service.

Article 7 – Electronic Money Account
7.1. Your Electronic Money Account
To open a Crypto-account via the Application, you must also open an Electronic Money Account.

Shares Digital Assets is not an electronic money issuer or an agent of the latter but arranges for you to open an Electronic Money Account with an Electronic Money Institution. We therefore sometimes refer to this account as your This account is limited to use by the Electronic Money Institution in connection with our Application. If you stop using our Application, the Electronic Money Account will be closed as it is made available by our Electronic Money Institution only to you as an active user of the Application.

The Electronic Money Account and related payment services are provided to you by the Electronic Money Institution, in accordance with the Terms and Conditions of outsourced Payment Services as accepted by you during our process of entering into a relationship. Your electronic money credited to the Electronic Money Account is held by the Electronic Money Institution, in accordance with the protection rules laid down for this type of service provider. You must refer to the terms and conditions of the Electronic Money Institution for further information.

Please note that your Electronic Money Account is not a bank account or a deposit account. As a result, assets held in this account are not eligible for the deposit insurance scheme.

Any electronic money required to settle your Transactions or any amount related to your Transactions will be debited from your Electronic Money Account on the day of the Transaction and paid the same day into an Electronic Money Settlement Account, opened with the Electronic Money Institution, for the purpose of transmitting the payment to our partner Digital Asset Marketplace.

It is possible to contact the Electronic Money Institution to request the closure of your Electronic Money Account. The closure of the Electronic Money Account may make it impossible to access the Buy and Sell Service. A User without an Electronic Money Account may be restricted to accessing only the Custodial Service, and, where applicable if accepted by us, the Exchange Service.

7.2. How to pay for Orders transmitted via the Application
Before placing an Order, you will need to credit your Electronic Money Account by sending money from a bank account in your name, located in the EEA or, where applicable, an equivalent country, to the Electronic Money Institution via SEPA transfer, credit card payment or SEPA debit, or any other method available within the Application, depending on the options and/or payment acquiring partners available in your jurisdiction.

You can do this via the Application by using the function to top up your Electronic Money Account.

If you attempt to add funds from an account opened in the name of a third party, your payment will be rejected by the Electronic Money Institution used for the acquisition of payment by credit card.

When using card top-up, you may only add funds from an eligible card in your name and the top-up will be completed within twenty-four (24) hours.

Any card top-up will be strictly related to the top-up of your Electronic Money Account - any subsequent conversion or purchase will be unrelated to the original card transaction.

The Electronic Money Institution will issue electronic money upon receipt of your funds. Electronic money credited to your Electronic Money Account will be stored and may later be exchanged and used to pay for your Orders.

You may credit your Electronic Money Account for future Transactions or you may top up your Electronic Money Account for particular Transactions as and when required. If you supply your Electronic Money Account prior to making Transactions or credit it with more funds than are necessary for your short-term needs with respect to the payment of your Transactions, you will not receive any interest.

When you submit an Order to buy a Digital Asset, an estimate of what you would have to pay for that Digital Asset (it is estimated because of the need, if any, for currency conversion) plus brokerage and execution costs and fees, is immediately earmarked in your Electronic Money Account. The exact amount is then payable when the Order is executed.

You acknowledge and agree that we are acting as an Authorised User, as defined in the Modulr T&Cs, with respect to the payment of Transactions via the Application, by ordering the transfer of funds from your Electronic Money Account in order to make payment for your Orders if necessary, and only upon your express instruction. This may include any additional amount required to settle Transactions in the event that an order is ultimately executed at a price different from the indicative price quoted, i.e. in the event of a market movement after the transmission of an Order.

As an Authorised User, we may request the Electronic Money Institution to transfer the amount required from you for a Transaction (gross of our Transaction Fees that you authorise us to transfer to our own account, if any) to the Electronic Money Settlement Account opened with the same Electronic Money Institution.

7.3. How proceeds of sale of an Investment will be credited to you
If you sell a Digital Asset and the proceeds are due to you from that sale, we will ensure that your Electronic Money Account is credited with the value of the proceeds of the sale received from the partner Digital Asset Marketplace. However, you should be aware that, whilst your profits may be credited to your Electronic Money Account, you will not be able to withdraw those proceeds until the Transaction resulting from your Order to sell has been settled.

7.4 . Pricing
Further details on the applicable Service Fees and charges that are levied for Transactions are provided in our Fees Policy, available in Appendix 3. The Fees Policy is available at all times on our website and on the Application. Transaction Fees and charges will only be applied to Orders that have been transmitted by us and subsequently executed.

You declare that you have read our Fees Policy when signing this Agreement. These pricing conditions contain in particular the pricing of transactions on Digital Assets as well as, in general, the remuneration received by us in connection with the performance of these Crypto T&Cs. These fees may be modified by us at any time. In this case, you will be informed of the changes in fees in accordance with the conditions set out in Article 13 of these Crypto T&Cs.

Article 8 - Mutual obligations
8.1. Our statements and commitments
We act in accordance with the Applicable Regulations and in compliance with the customs and practices of the profession we are in.

To the extent permitted by the Applicable Regulations, we shall not be liable for any breach of our contractual obligations or for any financial loss in the event of force majeure, or for any other event beyond our control that we could not reasonably have prevented, such as a breakdown in the means of transmission of Orders between you and us, or between us and the Electronic Money Institution, or between us and the partner Digital Asset Marketplace.

We are subject to professional secrecy and ensure maximum confidentiality in our interactions with you.

8.2. Your statements and commitments
You are required to provide us with all the information necessary to enable, after the execution of your Orders, the regular registration in your Crypto-account of the Transactions processed, any commitments made and the Digital Assets you hold as well as, if we are required to do so, your declaration to the competent tax authorities.

You agree to use the Content and the information we provide for your personal use only.

You declare that, prior to the opening of your Crypto Account under the conditions set out herein, you have had access to a general description of the nature and risks of the Digital Assets to which the Crypto Services subject hereof may relate. The risks are described in Appendix 1 of these Crypto T&Cs which you have read carefully.

You accept full responsibility for the Transactions initiated through the Application. You declare that you are aware of the price volatility of the Digital Assets and the random nature of the transactions carried out on the Digital Assets Marketplace, as well as the extent of the financial risks that may arise from the execution of the transactions that you have initiated via the Application.

You acknowledge that you have not been the subject of any act of banking and financial canvassing for the purpose of entering into this Agreement .

You declare, upon reading this Agreement :

Not be subject to any prohibition or incapacity to enter into any commitment under the terms of this Agreement , with regard to French law, your national law and/or the law of your country of residence;
Not to be restricted from carrying out the operations provided for under the terms of this Agreement  by reason of your matrimonial property regime or your professional obligations;
To comply with the contractual, legal, tax and regulatory provisions applicable to the transactions carried out under this Agreement  and provide us with the documents necessary for the performance of our contractual, legal, tax and regulatory obligations.
You undertake to inform us promptly if any of these elements change.

Article 9 - Taxation
It is your responsibility to comply with your legal and regulatory obligations in force regarding the taxation of your Crypto-account. You are reminded that the particular tax treatment of a product or service depends on the individual situation of each person. This tax treatment may change over time.

Therefore, you should be alert, with the help of tax counsel if necessary, to tax changes entering into force in your country of tax residence in particular in the event of multiple tax residences. We make no commitment to provide service or advice on the tax treatment of our Customers.

In application of international tax information exchange agreements entered into by France in the context of FATCA and AEI, we may be required to make, if necessary, a declaration to the French tax administration or a foreign tax administration for the Customers concerned by these regulations.

Article 10 - Personal data
We undertake to make every effort to ensure the security and confidentiality of the personal data in accordance with the Applicable Regulations.

We undertake that only authorised personnel will be authorised to access your personal data.

Access to premises and servers on which data is collected, processed and archived is strictly limited. Appropriate technical and organisational measures have been taken to prevent any unauthorised access.

You are informed when opening your Crypto-account, and in this Agreement that we collect and process personal data about you automatically. More generally, you agree to the processing of your personal data as defined in our Privacy Policy, provided separately in the Application. You have relative rights in relation to your personal data and can find information related to how to exercise these rights in our Privacy Policy. The collection and processing of personal data carried out by us, in our capacity as data controller within the meaning of Regulation (EU) 2016/679 of 27 April 2016 on the protection of natural persons with regard to the processing of personal data and on the free movement of such data (the “GDPR Regulation”), is necessary for the opening of a Crypto-account and the provision of the Services, the constitution of customer files, the proper administration of commercial relations between you and us and allows us to improve the customer experience. This data is intended for us and our service providers and partners located in and outside the European Union for the purposes hereof, but will not be used by third parties for the purpose of canvassing you.

Your personal data is retained for as long as necessary to meet the purposes for which we have collected this data, whether legal, regulatory, accounting or related to reporting obligations.

The majority of information is kept for a minimum period of five (5) years at the end of the contractual relationship, in accordance with legal and regulatory obligations related to the fight against money laundering and the financing of terrorism.

In the event of a dispute related to the use of your data by us, you are informed that you can refer the matter to the French Data Protection Authority (Commission Nationale de Informatique et des Libertés).

Article 11entry into force
11.1. Duration of the Agreement
The Agreement is signed for an indefinite period until terminated by either Party under the conditions set out in Article 12 of these Crypto T&Cs.

11.2. Entry into force
This Crypto-account Agreement shall enter into force under the conditions set out in Article 3.2 of these Crypto T&Cs.

Article 12 Termination and closure of the Crypto-account
12.1. Termination
The Agreement may be terminated at any time, and the Crypto-account closed, by the Customer or by Shares Digital Assets, by notice provided on the Application, subject to fifteen days notice if the request for termination is at your initiative, and subject to thirty days notice, if the termination is at our initiative, or any other period agreed between you and us. The notice period shall run from the date of notification on the Application.

It may be terminated automatically and without notice in the cases set out in the App T&Cs.

It will also be automatically terminated, at our initiative, in the event of non-performance by you of any obligation whatsoever resulting from this Agreement  or resulting from the legal or regulatory provisions applicable to you. The termination will then take effect eight calendar days following the sending of a formal notice by electronic means, if you have not fully remedied the situation within the aforementioned period of eight days.

In addition, the Agreement will be terminated ipso jure and without prior formal notice in the following cases:

the abnormal operation of the Crypto-account, the qualification of which is left to our discretion;
the improper performance or non-performance of these Crypto T&Cs and/or the App T&Cs and/or the Modulr T&Csand/or any other contractual commitment between the Customer and SDA, due to the fault of the Customer, fraud, negligence or error attributable to the Customer;
the reasonable suspicion of the commission of illegal activities, fraudulent acts or misrepresentation by the Customer.
The termination of the App T&Cs, and the concomitant closure of the User Account and/or the termination of the agreements made with the Electronic Money Institution relating to the Electronic Money Account, will result in the automatic termination of these Crypto T&Cs and the closure of the Crypto-account.

12.2. Consequences of the termination
The closure of the Crypto-account will put an end to any transaction usually carried out on the account with the exception of transactions in progress on the closing day and not definitively settled. You must maintain, if applicable, the balance on the Electronic Money Account associated with the Crypto-account, and take all measures to ensure that your Crypto-account does not record any transaction in the future. Any proceeds from the sale of your Investment will be credited to your Electronic Money Account.

In the event of closure of the Crypto-account, and even if it is a closure following the closure of the account at your request following a proposal to modify these Crypto T&Cs or the pricing, the Service Fees incurred by the closure of the Crypto-account will be deducted according to the Fees Policy then in force.

If the Crypto-account is closed at your initiative, you must ensure that your Digital Assets are sold before the effective closure of your Crypto-account. In the event of the closure of your Crypto-account on our initiative or in the event of a closure of your Crypto-account on your initiative if all of your Digital Assets have not been sold on the date of the effective closure of your Crypto-account, you agree to sell your Digital Assets as soon as possible and in any event within a maximum period of ten (10) calendar days following the effective closure of your Crypto-account due to the impossibility, at this stage, to transfer your Digital Assets to a crypto account outside the Application or to a wallet belonging to you. In the event that you have not sold all of your Digital Assets within the aforementioned period, you irrevocably authorise Shares Digital Assets to sell all of the Digital Assets held in your Crypto-account on the date in question and expressly acknowledge that Shares Digital Assets cannot incur any liability of any kind in this regard. Any proceeds from the sale of your Digital Assets will be credited to your Electronic Money Account.

If you do not provide other bank details before the end of the notice period, we will send you the proceeds from the sale of the Digital Assets to the bank account you used when you opened your Electronic Money Account.

These provisions, which you expressly accept, mean we will:

sell the Digital Assets in chronological order of acquisition, from the oldest to the most recent;
unless otherwise instructed by you, send you to the bank account opened in your name, the details of which were communicated when you entered into contact with us, a transfer of an amount equal to the balance of the Electronic Money Account attached to the Crypto-account at the end of the above transactions, less all the Service Fees attached to the above transactions, as mentioned in our pricing policy.
In this context, you acknowledge that the sale of the Digital Assets belonging to you under the conditions specified above may not in any way engage our liability.

If you die, we will suspend your Crypto-account, as soon as possible and once we have been informed of your death by a person with the requisite authority and evidence and we will automatically close your Crypto-account and convert it into an estate account. The registered Digital Assets will be sold and the corresponding funds will be transferred to your Electronic Money Account. The balance in your Electronic Money Account may form part of your estate and, subject to receiving confirmation from an appropriate representative, responsible for managing your estate, we may act as instructed by such representative(s). These Crypto T&Cs will remain in full force and effect after your death, until your Crypto-account is permanently closed and the agreement between us on these Crypto T&Cs is terminated.

Article 13 – Changes to these Trading T&Cs
Any proposed changes to these Crypto T&Cs, including any proposed changes to out Fees Policy, will be notified to you via the Application, by email or by any other means chosen by us, thirty (30) Business Days before the planned date of entry into force.

The absence of objection on your part before this date of entry into force shall constitute acceptance of these changes and, consequently, the maintenance of the account relationship after the entry into force of these changes shall result in their automatic application.

If you do not agree with our changes, any objection on your part must be sent to us by email to our customer service, before the effective date. You must ensure that it has been received by us by written confirmation from our services. Such objection shall automatically constitute a request for termination under the conditions set out in Article 12 of these Crypto T&Cs. You will then have a notice period of fifteen (15) Business Days before closing your account, in accordance with the provisions of said article.

Notwithstanding the above mentioned principles, any change to these Crypto T&Cs by reason of legislative or regulatory measures, or for legitimate reasons such as important operational reasons, shall automatically enter into force on its date of application without following the process described above. The same shall apply for all additions and/or modifications of Crypto features or Services, free of charge, or for consideration, that will be brought to your attention by simple email, or notification via the Application, and will enter into force as of right on the application date indicated.

Article 14 – No Deposit Insurance
Shares Digital Assets is not a member of the Deposit Guarantee Scheme and Resolution provided for by Articles L312-4 et seq. and L.322-1 of the French Monetary and Financial Code. This deposit insurance mechanism is not applicable to the Crypto-account or the Electronic Money Account.

The Customer may obtain more information on this subject by visiting the website: www.garantiedesdepots.fr.

Article 15 – Liability and exclusion of liability
TO THE EXTENT PERMITTED BY LAW, WE DO NOT ACCEPT ANY LIABILITY FOR LOSS OF PROFITS, REVENUE, VALUE, EARNINGS OR DATA, OR DIRECT, CONSEQUENTIAL OR INDIRECT DAMAGES SUFFERED BY YOU OR ANY THIRD PARTY.

To the extent permitted by the Applicable Regulations, we shall not be liable to you in the event of non-performance or improper performance of the Agreement by you, fraud, negligence or error attributable to you, the occurrence of a Force Majeure event, Technical Failure or one or more of the events set out in Articles 10, 11, 13, 15 and 16 or the actions of third parties, and/or pursuant to any other specific provision relating to our absence of liability under these Crypto T&Cs, and/or the App T&Cs.

You are solely responsible for the choices you make in using the Services.

You are duly advised of the risks surrounding the Services and the Digital Assets. In this context, we shall be liable for:

The stability of the price of Digital Assets due to their high volatility;
The loss, theft or disclosure to a third party, intentionally or unintentionally of your Login credentials or password;
A cyber-attack, computer virus, malware, breakdown, theft, loss or failure of your telephone or computer device blocking access to your Crypto-account or leading to access by a third party;
Burglary, theft, extortion, violence, blackmail, fraud, manipulation of person, abuse of weakness, or any other criminal offence suffered by you which may have resulted in the loss of Digital Assets or the provision of Crypto Services not desired by you;
Loss or theft of Digital Assets in any way;
Illegal use of Digital Assets purchased through us.
We endeavour, to the extent possible, to keep the Website and the Application accessible 7 days a week and 24 hours a day. Nevertheless, the use of the Application may be temporarily suspended, due to technical maintenance work, migration or updates, breakdowns or constraints related to the operation of the Internet or the communication networks used by us or our partners.

The networks on which the data circulate have various characteristics and capacities and are likely to be saturated at certain times of the day, which is likely to affect their download times and accessibility. We cannot be held liable due to a malfunction or inability to access the Application by third parties or you, a congestion of the Internet network, unsuitable equipment that you would use, an operation of maintenance or update of the Application or any other circumstance that would be beyond our control or in case of Force majeure. In particular, we cannot accept any responsibility for any financial consequences that could result from your inability to access the Application and/or use the Crypto Services for the reasons indicated above.

Article 16 Complaints and mediation
If you have any complaints regarding the Services provided under these Crypto T&Cs, please notify us. We can be contacted via email at complaints@shares.io or the in-app chat function.
For more information on how we will deal with your complaint, or to find out your remedies in the event of dissatisfaction, please refer to our Complaint Handling Policy.
Article 17  Governing Law and courts
For the performance of these Crypto T&Cs, the Parties agree to elect domicile at their registered office or their domicile.

The Parties declare that these Crypto T&Cs is subject to French law. In the event of disputes, the courts competent to rule on disputes arising from the interpretation or performance of these Crypto T&Cs shall, in accordance with ordinary law, be those within the jurisdiction of the domicile or residence of the defendant.

APPENDIX 1: Risk disclosure
The potential risks incurred are available on our website here.

APPENDIX 2: Your relationship with ModulR and ours
When you open your accounts via the Application, you also have an Electronic Money Account opened under the terms and conditions that you accept at the time of entering into a relationship.

Your Electronic Money Account is managed and held by ModulR Finance B.V which is an electronic money issuer authorised by the National Bank of the Netherlands (DNB) under number R182870.

Modulr provides you with the Electronic Money Account and the ability to make and receive payments for your orders through the Electronic Money Account

Your relationship with ModulR is direct and subject to the terms and conditions of Modulr FS Europe Ltds Terms of Use which can be found here.

For the purposes of these Terms of Use, you will receive payment services.

We are partners of ModulR under a partnership agreement and have a separate agreement with ModulR regarding our own Electronic Money Account.  This Agreement does not give rise to any right of any kind whatsoever for the benefit of Customers, including you, on our Electronic Money Account and/or on the Electronic Money Settlement Account opened under the aforementioned conditions.
              </p>

              <p>
                Regulatory conditions may change without notice. Government actions may restrict,
                tax, freeze, or seize digital assets, potentially resulting in partial or total loss.
              </p>

              <p>
                Blockchain transactions are irreversible. Errors caused by incorrect wallet
                addresses, incompatible networks, or user mistakes cannot be undone.
              </p>

              <p>
                No representations are made regarding uptime, availability, accuracy, or reliability
                of services. Interruptions or failures may occur at any time.
              </p>

              <p>
                To the fullest extent permitted by law, all liability for losses arising from use
                of this service is disclaimed.
              </p>

              <p>
                Continued use of this service constitutes acknowledgment and acceptance of all
                risks, disclaimers, and limitations described on this page.
              </p>
            </div>
        </div>

        {/* Main Content */}
        <div className="px-5 pt-6 pb-10 space-y-8 text-sm leading-relaxed text-white/80">

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-white">
              Crypto Service Policy & Disclaimer
            </h2>
            {policyLines.map(line => (
              <p key={line}>{line}</p>
            ))}
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-white">Key Terms</h3>
            <ul className="space-y-2">
              {keyTerms.map(item => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-2">
            <p>Users are responsible for compliance with:</p>
            <ul className="list-disc pl-4 space-y-1">
              {compliance.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="space-y-2">
            <p>By using our services, you confirm that:</p>
            <ul className="list-disc pl-4 space-y-1">
              {confirmations.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <p>
              Use of this platform is voluntary and entirely at your own risk. We aim for
              transparency without guarantees or promises of profit.
            </p>
          </section>

        </div>
      </div>
    </main>
  )
}
