import React, { useEffect, useState } from 'react';
import axios from "axios";
import style from "../NamazTime/style.module.css";

function Namaz() {
    const [prayerTimes, setPrayerTimes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [city, setCity] = useState('');
    const [prayerDate, setPrayerDate] = useState([]);
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const formattedMonth = month < 10 ? "0" + month : month;
    const formattedDay = day < 10 ? "0" + day : day;
    const parametrDate = `${year}-${formattedMonth}-${formattedDay}`;
    const showDate = `${formattedDay}.${formattedMonth}.${year}`;
    const cityParam = city || 'Ganja'; 

    useEffect(() => {
        const fetchPrayerTimes = async () => {
            const url = `http://api.aladhan.com/v1/calendarByCity/${year}/${month}?city=${cityParam}&country=Azerbaijan&method=`;
            try {
                const response = await axios.get(url);
                setPrayerTimes(response.data.data);
                setLoading(false);
            } catch (error) {
                setError("Error fetching prayer times. Please try again later.");
                setLoading(false);
            }
        };

        fetchPrayerTimes();
    }, [cityParam, year, month]);

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                showPosition,
                error => {
                    setError("Error getting geolocation. " + error.message);
                    setLoading(false);
                }
            );
        } else {
            setError("Geolocation is not supported by this browser.");
            setLoading(false);
        }
    }, []);

    function showPosition(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const dateUrl = `http://api.aladhan.com/v1/timings/${parametrDate}?latitude=${latitude}&longitude=${longitude}`;

        fetchPrayerDate(dateUrl);
    }

    const fetchPrayerDate = async (dateUrl) => {
        try {
            const response = await axios.get(dateUrl);
            setPrayerDate(response.data.data);
            setLoading(false);
        } catch (error) {
            setError("Error fetching prayer times. Please try again later.");
            setLoading(false);
        }
    };

    const handleSubmit = () => {
        setCity('');
    }

    return (
        <div>
            <div>
                <h1>{showDate}</h1>
            </div>
            <div>
                <input
                    className={style.input}
                    value={city}
                    placeholder='Type city in Azerbaijan'
                    name='city'
                    onChange={(e) => setCity(e.target.value)}
                    type="text" />
            </div>
            {loading ? (
                <div>Loading...</div>
            ) : error ? (
                <div>{error}</div>
            ) : (
                <div>
                    <table className={style.table}>
                        <thead>
                            <tr className={style.headtr}>
                                <th>Gün</th>
                                <th>İmsak</th>
                                <th>Gün Çıxır</th>
                                <th>Zöhr</th>
                                <th>Əsr</th>
                                <th>Məğrib</th>
                                <th>Şam</th>
                            </tr>
                        </thead>
                        <tbody>
                            {prayerTimes.map((item, index) => (
                                <tr key={index} className={style.bodytr}>
                                    <td>{item.date.gregorian.day}</td>
                                    <td>{item.timings.Imsak.slice(0, -5)}</td>
                                    <td>{item.timings.Sunrise.slice(0, -5)}</td>
                                    <td>{item.timings.Dhuhr.slice(0, -5)}</td>
                                    <td>{item.timings.Asr.slice(0, -5)}</td>
                                    <td>{item.timings.Maghrib.slice(0, -5)}</td>
                                    <td>{item.timings.Isha.slice(0, -5)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default Namaz;
