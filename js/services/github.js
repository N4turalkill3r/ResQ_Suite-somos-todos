/**
 * services/github.js
 * Todo lo relacionado con la API de GitHub. No toca el DOM ni el estado:
 * recibe datos, devuelve datos.
 */

import { SYNC } from '../config.js';

/** Error con mensaje listo para mostrar al usuario. */
export class GitHubError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'GitHubError';
    this.status = status;
  }
}

const ERROR_MESSAGES = Object.freeze({
  401: 'El token no es válido.',
  403: 'GitHub alcanzó el límite de consultas. Agrega un token o espera un momento.',
  404: 'No se encontró ese usuario de GitHub.',
});

/**
 * Arma la URL de una página de repositorios.
 * Con token se usa /user/repos (incluye privados); sin token, el listado público.
 */
function buildUrl({ user, token }, page) {
  const params = `per_page=${SYNC.perPage}&sort=updated&page=${page}`;
  return token
    ? `https://api.github.com/user/repos?affiliation=owner&${params}`
    : `https://api.github.com/users/${encodeURIComponent(user)}/repos?${params}`;
}

/**
 * Descarga todos los repositorios (paginando).
 * @param {{user: string, token: string}} credentials
 * @returns {Promise<object[]>} Repos tal como los devuelve GitHub.
 * @throws {GitHubError} Si GitHub responde con un error.
 */
export async function fetchRepositories(credentials) {
  const headers = { Accept: 'application/vnd.github+json' };
  if (credentials.token) headers.Authorization = `Bearer ${credentials.token}`;

  const repos = [];
  for (let page = 1; page <= SYNC.maxPages; page++) {
    const response = await fetch(buildUrl(credentials, page), { headers });
    if (!response.ok) {
      throw new GitHubError(
        ERROR_MESSAGES[response.status] ?? `Error de GitHub (${response.status}).`,
        response.status,
      );
    }
    const batch = await response.json();
    repos.push(...batch);
    if (batch.length < SYNC.perPage) break; // última página
  }
  return repos;
}

/**
 * Deja solo los repos que cuentan como "herramienta":
 * sin forks, sin archivados y, si se indica, con el topic elegido.
 */
export function selectToolRepos(repos, topic) {
  return repos.filter(
    (repo) =>
      !repo.fork &&
      !repo.archived &&
      (!topic || (repo.topics ?? []).includes(topic)),
  );
}

/**
 * Determina la URL pública de la herramienta:
 *  1. Campo "Website" del repo, si existe.
 *  2. GitHub Pages, si está activado.
 *  3. Cadena vacía si el repo no tiene página web.
 */
function resolveToolUrl(repo) {
  if (repo.homepage && /^https?:\/\//i.test(repo.homepage)) return repo.homepage;
  if (!repo.has_pages) return '';

  const owner = repo.owner.login.toLowerCase();
  const name = repo.name.toLowerCase();
  // Repos tipo "usuario.github.io" se publican en la raíz del dominio.
  return name.endsWith('.github.io')
    ? `https://${name}/`
    : `https://${owner}.github.io/${repo.name}/`;
}

/** Convierte un repo de GitHub en el modelo interno de la app. */
export function repoToTool(repo) {
  return {
    id: repo.id,
    name: repo.name,
    description: repo.description || '',
    url: resolveToolUrl(repo),
    topics: repo.topics ?? [],
    updatedAt: repo.pushed_at,
    isPrivate: Boolean(repo.private),
  };
}
