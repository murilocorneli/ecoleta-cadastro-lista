import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import './styles.css'
import logo from '../../assets/logo.svg'
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi'
import { Map, TileLayer, Marker } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import Api from '../../services/api';
import axios from 'axios';
import Dropzone from '../../components/dropzone'

const CreatePoint = () => {

    //informando manualmente o tipo das variaveis de array ou objeto.
  
    interface IBGESiglaResponse {
        sigla: string,
        nome: string
    }
    interface items {
        id: number,
        title: string,
        image_url: string
    }
    const [items, setItems] = useState<items[]>([]);
    const [selectedFile, setSelectedFile] = useState<File>()
    const [ufs, setUfs] = useState<string[]>([]);
    const [selectedUf, setSelectedUf] = useState('0');
    const [selectedCity, setSelectedCity] = useState('0');
    const [city, setCity] = useState<string[]>([])
    const [selectedMap, setSelectedMap] = useState<[number, number]>([0, 0])
    const [InitialPosition, setInitionPosition] = useState<[number, number]>([-29.9422204, -51.0854015])
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: ''
    });
    const [selectedItens, setSelectedItems] = useState<number[]>([]);

    const history = useHistory();

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            setInitionPosition([latitude, longitude])
        })
    }, [])

    //executa apenas uma vez a requisição se o [] estiver vazio.
    useEffect(() => {
        Api.get('items').then(res => {
            setItems(res.data)
        });
    }, [])

    //requisitando os estados
    useEffect(() => {
        axios.get<IBGESiglaResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(res => {
            const ufInitials = res.data.map(uf => uf.sigla)
            setUfs(ufInitials);
        });

    }, [])
    //buscando cities
    useEffect(() => {
        axios.get<IBGESiglaResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(res => {
            const citys = res.data.map(city => city.nome)
            setCity(citys);
        })
    }, [selectedUf])

    //pegando a uf do formulario
    function HandleSelectedUf(event: ChangeEvent<HTMLSelectElement>) {
        const uf = event.target.value;
        setSelectedUf(uf);
    }
    //pegando a cidade do formulario
    function HandleSelectedCity(event: ChangeEvent<HTMLSelectElement>) {
        const city = event.target.value;
        setSelectedCity(city);
    }

    //clicar no mapa
    function HandleMapClick(event: LeafletMouseEvent) {
        setSelectedMap([
            event.latlng.lat,
            event.latlng.lng
        ]);
    }
    function HandleInputChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value })
    }
    function HandleSelectedItem(id: number) {

        const alreadySelected = selectedItens.findIndex(item => item === id)

        if (alreadySelected >= 0) {
            const filteredItems = selectedItens.filter(item => item !== id);
            setSelectedItems(filteredItems);
        } else {
            setSelectedItems([...selectedItens, id]);
        }
    }

    async function HandleSubmit(event: FormEvent){
        event.preventDefault();

        const {name, email, whatsapp} = formData;
        const uf = selectedUf;
        const city = selectedCity;
        const [latitude, longitude] = selectedMap;
        const items = selectedItens;

        const data = new FormData()

                data.append('name', name);
                data.append('email', email);
                data.append('whatsapp', whatsapp);
                data.append('uf', uf);
                data.append('city', city);
                data.append('latitude', String(latitude));
                data.append('longitude', String(longitude));
                data.append('items', items.join(','));
                if(selectedFile){
                    data.append('image', selectedFile);
                }
              
        await Api.post('points', data);
        history.push('/');
        alert('cadatrado com sucesso')
    }
    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta" />
                <Link to="/">
                    <FiArrowLeft />
                    Voltar Para Home
                </Link>
            </header>

            <form onSubmit={HandleSubmit}>
                <h1>Cadastro do <br /> ponto de coleta</h1>
                <Dropzone onFileUploaded = {setSelectedFile}    />
                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>
                    <div className="field">
                        <label htmlFor="email"> E-mail </label>
                        <input type="email" name="email" id="email" onChange={HandleInputChange} />
                    </div>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="whatsapp"> Whatsapp </label>
                            <input type="text" name="whatsapp" id="whatsapp" onChange={HandleInputChange} />
                        </div>
                        <div className="field">
                            <label htmlFor="name"> Nome da Entidade </label>
                            <input type="text" name="name" id="name" onChange={HandleInputChange} />
                        </div>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa.</span>
                    </legend>
                    <Map center={InitialPosition} zoom={15} onClick={HandleMapClick}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={selectedMap}>
                        </Marker>
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (uf)</label>
                            <select onChange={HandleSelectedUf} value={selectedUf} name="uf" id="uf">
                                <option value="0">Selecione uma UF</option>
                                {ufs.map(uf => (
                                    <option key={uf} value={uf}>{uf}</option>

                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select onChange={HandleSelectedCity} value={selectedCity} name="city" id="city">
                                <option value="0">Selecione uma cidade</option>
                                {city.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>
                        <h2>Ítems de coleta</h2>
                        <span>Selecione um ou mais itens abaixo.</span>
                    </legend>
                    <ul className="items-grid">
                        {items.map(item => (
                            <li key={item.id} onClick={() => HandleSelectedItem(item.id)}
                                className={selectedItens.includes(item.id) ? 'selected' : ''}>
                                <img src={item.image_url} alt={item.title} />
                                <span>{item.title}</span>
                            </li>

                        ))}
                    </ul>

                </fieldset>
                <button type="submit">
                    Cadastrar Ponto de Coleta
                    </button>
            </form>

        </div>
    )
}

export default CreatePoint;