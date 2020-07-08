import React, { useState, useEffect, ChangeEvent } from 'react';
import Api from '../../services/api'
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi'
import logo from '../../assets/logo.svg';
import './styles.css'
import Axios from 'axios';
import { map, point } from 'leaflet';

const ListPoints = () => {

    interface IBGESiglaResponse {
        sigla: string,
        nome: string
    }
    interface items {
        id: number,
        title: string,
        image_url: string
    }
    interface point {
        name: string,
        whatsapp: string,
        city: string,
        uf: string,
        email: string,
        id: number,
        image_url: string
    }
    interface points {
        point: point,
        items: items[]


    }
    const [listPoints, setListPoints] = useState<point[]>([])
    const [selectedPoint, setSelectedPoint] = useState<points>()
    const [items, setItems] = useState<items[]>([]);
    const [uf, setUfs] = useState<string[]>([])
    const [selectedUf, setSelectedUf] = useState('0');
    const [selectedCity, setSelectedCity] = useState('0');
    const [city, setCity] = useState<string[]>([])
    const [selectedItens, setSelectedItems] = useState<number[]>([]);
    const [itemsPoint, setItemsPoint] = useState<items[]>([])

    //executa apenas uma vez a requisição se o [] estiver vazio.
    useEffect(() => {
        Api.get('items').then(res => {
            setItems(res.data)
        });
    }, [])

    useEffect(() => {
        Axios.get<IBGESiglaResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(res => {
            const ufInitials = res.data.map(uf => uf.sigla)
            setUfs(ufInitials);
        });
    }, [])
    //buscando cities
    useEffect(() => {
        Axios.get<IBGESiglaResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(res => {
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
    function HandleSelectedItem(id: number) {

        const alreadySelected = selectedItens.findIndex(item => item === id)

        if (alreadySelected >= 0) {
            const filteredItems = selectedItens.filter(item => item !== id);
            setSelectedItems(filteredItems);
        } else {
            setSelectedItems([...selectedItens, id]);
        }
    }
    function ExibirPoint(point: point) {

        Api.get(`points/${point.id}`).then(res => {
            setSelectedPoint(res.data);
            console.log(res);
        })
    }
    async function HandleSubmit() {
        const uf = selectedUf;
        const city = selectedCity;
        const items = selectedItens;
        if (selectedItens.length === 0 && selectedCity === '0' && selectedUf === '0') {
            Api.get('points').then(res => {
                setListPoints(res.data);
            })
        }
        else {
            let itens = `&items=`;
            let i = 0;
            for (i = 0; i < items.length; i++) {
                if (i === 0) {
                    itens = itens + items[0];
                }
                else {
                    itens = itens + `&itens=${items[i]}`;
                }
            }
            Api.get(`pointsfilter?city=${city}&uf=${uf}${itens}`).then(res => {
                setListPoints(res.data);
            })
        }

    }


    return (
        <div className="container">
            <div id="page-list-point">
                <header className="mx-10">
                    <img src={logo} alt="Ecoleta" />
                    <Link to="/">
                        <FiArrowLeft />
                    Voltar Para Home
                </Link>
                </header>
                <div className="list-group">
                    <fieldset>
                        <div className="field-group">
                            <div className="field">
                                <label className="label-primary" htmlFor="uf">Estado (uf):</label>
                                <select onChange={HandleSelectedUf} value={selectedUf} name="uf" id="uf">
                                    <option value="0">Selecione uma UF</option>
                                    {uf.map(uf => (
                                        <option key={uf} value={uf}>{uf}</option>

                                    ))}
                                </select>
                                <label htmlFor="city">Cidade:</label>
                                <select onChange={HandleSelectedCity} value={selectedCity} name="city" id="city">
                                    <option value="0">Selecione uma cidade</option>
                                    {city.map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                                <button onClick={HandleSubmit} type="submit">Listar</button>
                            </div>
                            <div className="items">
                                <ul className="items-grid">
                                    {items.map(item => (
                                        <li key={item.id} onClick={() => HandleSelectedItem(item.id)}
                                            className={selectedItens.includes(item.id) ? 'selected' : ''}>
                                            <img src={item.image_url} alt={item.title} />
                                            <span>{item.title}</span>
                                        </li>

                                    ))}
                                </ul>
                            </div>

                        </div>

                    </fieldset>
                    <div className="list">
                        <a href="/" id="cab" className="text-center list-group-item active">
                            Coletores:
                        </a>
                        <table className="table">
                            <tr>
                                <th>ID</th>
                                <th>NOME</th>
                                <th>WHATSAPP</th>
                                <th>UF</th>
                                <th>CIDADE</th>
                            </tr>
                            {listPoints.map(point => {
                                return (
                                    <tr onClick={() => ExibirPoint(point)} data-toggle="modal" data-target="#siteModal" key={point.id}>
                                        <td>{point.id}</td>
                                        <td>{point.name}</td>
                                        <td>{point.whatsapp}</td>
                                        <td>{point.uf}</td>
                                        <td>{point.city}</td>
                                    </tr>
                                )
                            })}
                        </table>
                    </div>

                </div>
                <div className="modal fade" id="siteModal" role="dialog">

                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{selectedPoint?.point?.name}</h5>
                                <button type="button" className="close" data-dismiss="modal">
                                    <span>&times;</span>
                                </button>
                            </div>


                            <div className="modal-body">
                                <h5 className="text-center">Nome: {selectedPoint?.point?.name}</h5>
                                {selectedPoint?.point.image_url
                                ? 
                                    <img className="imagem" src={selectedPoint?.point.image_url} alt="point image" />
                                
                                :
                                <p>sem foto do estabelecimento.</p>
                                }
                               
                                <h6>Whatsapp: {selectedPoint?.point.whatsapp}</h6>
                                <h6>UF: {selectedPoint?.point?.uf}</h6>
                                <h6>Cidade: {selectedPoint?.point?.city}</h6>
                                <h6 className="text-center">Itens coletados</h6>
                                <ul>
                                    {selectedPoint?.items.map(item => (
                                        <li>{item.title}</li>
                                    ))}
                                </ul>

                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn" data-dismiss="modal">
                                    fechar
            </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>


    )
}

export default ListPoints;  