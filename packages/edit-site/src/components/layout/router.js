/**
 * WordPress dependencies
 */
import { privateApis as routerPrivateApis } from '@wordpress/router';
import { __ } from '@wordpress/i18n';
import { useEffect } from '@wordpress/element';
/**
 * Internal dependencies
 */
import { unlock } from '../../lock-unlock';
import Editor from '../editor';
import PostsList from '../posts-app/posts-list';
import PagePatterns from '../page-patterns';
import PageTemplates from '../page-templates';
import SidebarNavigationScreen from '../sidebar-navigation-screen';
import SidebarNavigationScreenGlobalStyles from '../sidebar-navigation-screen-global-styles';
import SidebarNavigationScreenMain from '../sidebar-navigation-screen-main';
import SidebarNavigationScreenNavigationMenus from '../sidebar-navigation-screen-navigation-menus';
import SidebarNavigationScreenTemplatesBrowse from '../sidebar-navigation-screen-templates-browse';
import SidebarNavigationScreenPatterns from '../sidebar-navigation-screen-patterns';
import SidebarNavigationScreenNavigationMenu from '../sidebar-navigation-screen-navigation-menu';
import DataViewsSidebarContent from '../sidebar-dataviews';
import {
	NAVIGATION_POST_TYPE,
	PATTERN_TYPES,
	TEMPLATE_PART_POST_TYPE,
	TEMPLATE_POST_TYPE,
} from '../../utils/constants';

const { useLocation, useHistory } = unlock( routerPrivateApis );

function useRedirectOldPaths() {
	const history = useHistory();
	const { params } = useLocation();
	useEffect( () => {
		const { postType, path, categoryType, ...rest } = params;

		if ( path === '/wp_template_part/all' ) {
			history.replace( { postType: TEMPLATE_PART_POST_TYPE } );
		}

		if ( path === '/page' ) {
			history.replace( {
				postType: 'page',
				...rest,
			} );
		}

		if ( path === '/wp_template' ) {
			history.replace( {
				postType: TEMPLATE_POST_TYPE,
				...rest,
			} );
		}

		if ( path === '/patterns' ) {
			history.replace( {
				postType:
					categoryType === TEMPLATE_PART_POST_TYPE
						? TEMPLATE_PART_POST_TYPE
						: PATTERN_TYPES.user,
				...rest,
			} );
		}

		if ( path === '/navigation' ) {
			history.replace( {
				postType: NAVIGATION_POST_TYPE,
				...rest,
			} );
		}
	}, [ history, params ] );
}

export default function useLayoutAreas() {
	const { params } = useLocation();
	const { postType, postId, path, layout, isCustom, canvas } = params;
	useRedirectOldPaths();

	// Page list
	if ( postType === 'page' ) {
		const isListLayout = layout === 'list' || ! layout;
		return {
			key: 'pages',
			areas: {
				sidebar: (
					<SidebarNavigationScreen
						title={ __( 'Pages' ) }
						backPath={ {} }
						content={ <DataViewsSidebarContent /> }
					/>
				),
				content: <PostsList postType={ postType } />,
				preview: ( isListLayout || canvas === 'edit' ) && <Editor />,
				mobile:
					canvas === 'edit' ? (
						<Editor />
					) : (
						<PostsList postType={ postType } />
					),
			},
			widths: {
				content: isListLayout ? 380 : undefined,
			},
		};
	}

	// Templates
	if ( postType === TEMPLATE_POST_TYPE ) {
		const isListLayout = isCustom !== 'true' && layout === 'list';
		return {
			key: 'templates',
			areas: {
				sidebar: (
					<SidebarNavigationScreenTemplatesBrowse backPath={ {} } />
				),
				content: <PageTemplates />,
				preview: ( isListLayout || canvas === 'edit' ) && <Editor />,
				mobile: <PageTemplates />,
			},
			widths: {
				content: isListLayout ? 380 : undefined,
			},
		};
	}

	// Patterns
	if (
		[ TEMPLATE_PART_POST_TYPE, PATTERN_TYPES.user ].includes( postType )
	) {
		return {
			key: 'patterns',
			areas: {
				sidebar: <SidebarNavigationScreenPatterns backPath={ {} } />,
				content: <PagePatterns />,
				mobile: <PagePatterns />,
				preview: canvas === 'edit' && <Editor />,
			},
		};
	}

	// Styles
	if ( path === '/wp_global_styles' ) {
		return {
			key: 'styles',
			areas: {
				sidebar: (
					<SidebarNavigationScreenGlobalStyles backPath={ {} } />
				),
				preview: <Editor />,
				mobile: canvas === 'edit' && <Editor />,
			},
		};
	}

	// Navigation
	if ( postType === NAVIGATION_POST_TYPE ) {
		if ( postId ) {
			return {
				key: 'navigation',
				areas: {
					sidebar: (
						<SidebarNavigationScreenNavigationMenu
							backPath={ { postType: NAVIGATION_POST_TYPE } }
						/>
					),
					preview: <Editor />,
					mobile: canvas === 'edit' && <Editor />,
				},
			};
		}
		return {
			key: 'navigation',
			areas: {
				sidebar: (
					<SidebarNavigationScreenNavigationMenus backPath={ {} } />
				),
				preview: <Editor />,
				mobile: canvas === 'edit' && <Editor />,
			},
		};
	}

	// Fallback shows the home page preview
	return {
		key: 'default',
		areas: {
			sidebar: <SidebarNavigationScreenMain />,
			preview: <Editor />,
			mobile: canvas === 'edit' && <Editor />,
		},
	};
}
