import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Configuration des destinataires
const LAWYER_CONTACTS = {
  emails: [
    'oladokunefi123@gmail.com',
    'ifiboysbeat1@gmail.com'
  ],
  whatsappNumbers: [
    '+22373402073',
    '+22376104155'
  ]
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      name, 
      email, 
      phone, 
      caseType, 
      message, 
      audioUrl, 
      requestType // 'form' ou 'voice'
    } = req.body;

    // Validation des données selon le type de demande
    if (!phone) {
      return res.status(400).json({ error: 'Numéro de téléphone requis' });
    }

    if (requestType === 'voice') {
      if (!audioUrl) {
        return res.status(400).json({ error: 'Fichier audio requis pour demande vocale' });
      }
    } else if (requestType === 'form') {
      if (!name || !email || !caseType || !message) {
        return res.status(400).json({ error: 'Tous les champs sont requis pour le formulaire écrit' });
      }
    }

    // Enregistrer la demande dans la base de données
    const { data: lawyerRequest, error: dbError } = await supabase
      .from('lawyer_requests')
      .insert([
        {
          name: name || null,
          email: email || null,
          phone,
          case_type: caseType || null,
          message: message || null,
          audio_url: audioUrl || null,
          request_type: requestType,
          status: 'pending',
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({ error: 'Erreur lors de l\'enregistrement' });
    }

    // Préparer le contenu du message
    const emailSubject = requestType === 'voice' 
      ? `Nouvelle demande d'assistance juridique (VOCAL)` 
      : `Nouvelle demande d'assistance juridique - ${caseType}`;
      
    const emailContent = requestType === 'voice' ? `
🎤 NOUVELLE DEMANDE VOCALE D'ASSISTANCE JURIDIQUE

📱 Téléphone: ${phone}
🎵 Fichier audio: ${audioUrl}

⚠️ DEMANDE VOCALE - Écoutez le message audio pour connaître les détails de l'affaire

ID de la demande: ${lawyerRequest.id}
Date: ${new Date().toLocaleString('fr-FR')}

---
Elverra Global - Système d'assistance juridique
    ` : `
📝 NOUVELLE DEMANDE ÉCRITE D'ASSISTANCE JURIDIQUE

👤 Nom: ${name}
📧 Email: ${email}
📱 Téléphone: ${phone}
⚖️ Type d'affaire: ${caseType}

💬 Message:
${message}

ID de la demande: ${lawyerRequest.id}
Date: ${new Date().toLocaleString('fr-FR')}

---
Elverra Global - Système d'assistance juridique
    `;

    // Envoyer les emails
    const emailPromises = LAWYER_CONTACTS.emails.map(async (recipientEmail) => {
      try {
        // Ici vous pouvez intégrer votre service d'email préféré
        // Pour l'exemple, je simule l'envoi
        console.log(`Email envoyé à: ${recipientEmail}`);
        console.log(`Sujet: ${emailSubject}`);
        console.log(`Contenu: ${emailContent}`);
        
        // Remplacez par votre service d'email réel (SendGrid, Mailgun, etc.)
        // await sendEmail(recipientEmail, emailSubject, emailContent);
        
        return { success: true, recipient: recipientEmail };
      } catch (error) {
        console.error(`Erreur envoi email à ${recipientEmail}:`, error);
        return { success: false, recipient: recipientEmail, error: error.message };
      }
    });

    // Préparer le message WhatsApp
    const whatsappMessage = requestType === 'voice' ? `🎤 *DEMANDE VOCALE D'ASSISTANCE JURIDIQUE*

📱 *Téléphone:* ${phone}
🎵 *Fichier audio:* ${audioUrl}

⚠️ *DEMANDE VOCALE* - Écoutez le message audio pour connaître les détails

🆔 *ID:* ${lawyerRequest.id}
📅 *Date:* ${new Date().toLocaleString('fr-FR')}

_Elverra Global - Assistance juridique_` : `📝 *DEMANDE ÉCRITE D'ASSISTANCE JURIDIQUE*

👤 *Client:* ${name}
📧 *Email:* ${email}
📱 *Téléphone:* ${phone}
⚖️ *Type d'affaire:* ${caseType}

*Message:*
${message}

🆔 *ID:* ${lawyerRequest.id}
📅 *Date:* ${new Date().toLocaleString('fr-FR')}

_Elverra Global - Assistance juridique_`;

    // Envoyer les messages WhatsApp
    const whatsappPromises = LAWYER_CONTACTS.whatsappNumbers.map(async (number) => {
      try {
        // Utilisation de l'API WhatsApp Business ou service tiers
        const whatsappApiUrl = `https://api.whatsapp.com/send?phone=${number.replace('+', '')}&text=${encodeURIComponent(whatsappMessage)}`;
        
        console.log(`WhatsApp préparé pour: ${number}`);
        console.log(`URL: ${whatsappApiUrl}`);
        
        // Ici vous pouvez intégrer votre API WhatsApp Business
        // await sendWhatsAppMessage(number, whatsappMessage);
        
        return { success: true, recipient: number };
      } catch (error) {
        console.error(`Erreur WhatsApp à ${number}:`, error);
        return { success: false, recipient: number, error: error.message };
      }
    });

    // Attendre tous les envois
    const [emailResults, whatsappResults] = await Promise.all([
      Promise.all(emailPromises),
      Promise.all(whatsappPromises)
    ]);

    // Mettre à jour le statut de la demande
    await supabase
      .from('lawyer_requests')
      .update({ 
        status: 'sent',
        notification_sent_at: new Date().toISOString()
      })
      .eq('id', lawyerRequest.id);

    return res.status(200).json({
      success: true,
      message: 'Demande envoyée avec succès',
      requestId: lawyerRequest.id,
      notifications: {
        emails: emailResults,
        whatsapp: whatsappResults
      }
    });

  } catch (error) {
    console.error('Error processing lawyer request:', error);
    return res.status(500).json({ 
      error: 'Erreur interne du serveur',
      details: error.message 
    });
  }
}
