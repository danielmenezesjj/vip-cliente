const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
const os = require('os');
const path = require('path');

const app = express();
const port = 8081;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(__dirname));

let currentFov = 0;
let bCrossAimbot = false;
let bSilentAimbot = false;
let bRecoil = false;
let vRecoil = false;
let bSpread = false;
let targetArea = ''; // Inicialização da variável para armazenar a área-alvo

// URL da API do GitHub para o arquivo JSON
const githubApiUrl = 'https://api.github.com/repos/danielmenezesjj/app-json/contents/teste.json';
const token = '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';

// Função para obter dados do arquivo JSON no GitHub usando a API do GitHub
async function getMacData() {
    try {
        const response = await axios.get(githubApiUrl, {
            headers: {
                'Accept': 'application/vnd.github.v3.raw',
                'Authorization': `token ${token}`
            }
        });

        const content = response.data;
        console.log(content);

        return content;
    } catch (err) {
        console.error('Erro ao acessar dados do GitHub:', err);
        throw err;
    }
}

// Rota para obter os dados dos endereços MAC
app.get('/get-macs', async (req, res) => {
    try {
        const macData = await getMacData();
        res.json({ macs: macData });
    } catch (error) {
        console.error('Erro ao acessar dados do GitHub:', error);
        res.status(500).json({ message: 'Erro ao acessar dados do GitHub.' });
    }
});

// Rota para verificar o acesso
app.get('/check_access', async (req, res) => {
    try {
        const macData = await getMacData();
        const clientMac = req.headers['x-client-mac'];

        if (macData.some(mac => mac.mac === clientMac)) {
            res.sendFile(path.join(__dirname, 'index.html'));
        } else {
            res.redirect(`/access_denied.html?mac=${encodeURIComponent(clientMac)}`);
        }
    } catch (error) {
        console.error('Erro ao acessar dados do GitHub:', error);
        res.status(500).send('Erro ao verificar acesso.');
    }
});

// Rota para obter o endereço IP local
app.get('/get_ip', (req, res) => {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return res.json({ ip: iface.address });
            }
        }
    }

    res.json({ ip: '127.0.0.1' });
});

// Rota para obter o FOV atual
app.get('/get_fov', (req, res) => {
    res.json({ fov: currentFov });
});

// Rota para atualizar o FOV
app.post('/set_fov', (req, res) => {
    const { fov } = req.body;
    currentFov = parseFloat(fov);
    res.json({ message: `FOV atualizado para ${currentFov}` });
});

// Rota para obter o estado atual
app.get('/get_state', (req, res) => {
    res.json({
        bCrossAimbot,
        bSilentAimbot,
        bRecoil,
        vRecoil,
        bSpread,
        targetArea // Adiciona a área alvo no estado retornado
    });
});

// Nova rota para definir a área alvo
app.post('/set_target', (req, res) => {
    const { area } = req.body;

    if (area === 'Cabeça') {
        targetArea = 'Head';
    } else if (area === 'Peito') {
        targetArea = 'Spine3';
    } else {
        return res.status(400).json({ message: 'Área alvo inválida.' });
    }

    res.json({ message: `Área alvo definida para ${targetArea}` });
});

app.post('/set_state', (req, res) => {
    const { key, value } = req.body;
    switch (key) {
        case 'bCrossAimbot':
            bCrossAimbot = value;
            break;
        case 'bSilentAimbot':
            bSilentAimbot = value;
            break;
        case 'bRecoil':
            bRecoil = value;
            break;
        case 'vRecoil':
            vRecoil = value;
            break;
        case 'bSpread':
            bSpread = value;
            break;
        case 'targetArea': // Adiciona a lógica para a área alvo
            if (value === 'Head' || value === 'Spine3') {
                targetArea = value;
            } else {
                return res.status(400).json({ message: 'Área alvo inválida.' });
            }
            break;
        default:
            return res.status(400).json({ message: 'Chave de estado inválida.' });
    }

    res.json({ message: `${key} atualizado para ${value}` });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
